import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { AuthenticatedUser } from "../auth/context";

export class MessagingError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number = 400, code: string = "MESSAGING_ERROR") {
    super(message);
    this.name = "MessagingError";
    this.status = status;
    this.code = code;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function listConversations(auth: AuthenticatedUser) {
  let whereClause: any = {};

  if (auth.role === UserRole.STUDENT) {
    if (!auth.studentProfile) return [];
    whereClause = { studentId: auth.studentProfile.id };
  } else if (auth.role === UserRole.CLIENT) {
    if (!auth.clientProfile) return [];
    whereClause = { clientId: auth.clientProfile.id };
  } else {
    return [];
  }

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    include: {
      client: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      student: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          title: true,
          budget: true,
          deadline: true,
          status: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          content: true,
          attachmentName: true,
          createdAt: true,
          readAt: true,
          senderId: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Calculate unread counts per conversation in parallel
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: auth.user.id },
          readAt: null,
        },
      });

      const latestMsg = conv.messages[0];
      const clientName = conv.client.companyName || conv.client.user.name || "Client";
      const studentName = conv.student.user.name || "Student";
      const lastMsgText = latestMsg
        ? latestMsg.content || (latestMsg.attachmentName ? `Attachment: ${latestMsg.attachmentName}` : "")
        : "No messages yet";
      const lastMsgAt = latestMsg ? formatRelativeTime(new Date(latestMsg.createdAt)) : formatRelativeTime(new Date(conv.createdAt));

      return {
        id: conv.id,
        projectId: conv.projectId,
        projectTitle: conv.project.title,
        studentId: conv.studentId,
        studentName,
        clientId: conv.clientId,
        client: clientName,
        clientInitial: clientName.charAt(0).toUpperCase() || "C",
        lastMessage: lastMsgText,
        lastMessageAt: lastMsgAt,
        unreadCount,
        clientStatus: "online" as const,
        clientStatusText: "Active today",
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      };
    })
  );

  return enriched;
}

export async function getConversation(conversationId: string, auth: AuthenticatedUser) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      student: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      project: {
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          workContracts: {
            where: {
              studentId: auth.studentProfile?.id,
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!conv) {
    throw new MessagingError("Conversation not found", 404, "NOT_FOUND");
  }

  // Verify participant authorization
  if (auth.role === UserRole.STUDENT) {
    if (!auth.studentProfile || conv.studentId !== auth.studentProfile.id) {
      throw new MessagingError("You are not authorized to view this conversation", 403, "FORBIDDEN");
    }
  } else if (auth.role === UserRole.CLIENT) {
    if (!auth.clientProfile || conv.clientId !== auth.clientProfile.id) {
      throw new MessagingError("You are not authorized to view this conversation", 403, "FORBIDDEN");
    }
  } else {
    throw new MessagingError("Access denied", 403, "FORBIDDEN");
  }

  const unreadCount = await prisma.message.count({
    where: {
      conversationId: conv.id,
      senderId: { not: auth.user.id },
      readAt: null,
    },
  });

  const clientName = conv.client.companyName || conv.client.user.name || "Client";
  const studentName = conv.student.user.name || "Student";
  const workContract = conv.project.workContracts[0] || null;

  return {
    id: conv.id,
    projectId: conv.projectId,
    projectTitle: conv.project.title,
    studentId: conv.studentId,
    studentName,
    clientId: conv.clientId,
    client: clientName,
    clientInitial: clientName.charAt(0).toUpperCase() || "C",
    unreadCount,
    clientStatus: "online" as const,
    clientStatusText: "Active today",
    project: {
      id: conv.project.id,
      title: conv.project.title,
      description: conv.project.description,
      budget: conv.project.budget,
      deadline: conv.project.deadline,
      skills: conv.project.skills.map((s) => s.skill.name),
      status: conv.project.status,
    },
    workContract: workContract
      ? {
          id: workContract.id,
          status: workContract.status,
          progress: workContract.progress,
        }
      : null,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
  };
}

export async function createOrGetConversation(
  projectId: string,
  studentProfileId: string,
  auth: AuthenticatedUser
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
    },
  });

  if (!project) {
    throw new MessagingError("Project not found", 404, "NOT_FOUND");
  }

  const clientId = project.clientId;

  // Authorization check: Caller must be either the student or the project's client
  const isStudent = auth.role === UserRole.STUDENT && auth.studentProfile?.id === studentProfileId;
  const isClient = auth.role === UserRole.CLIENT && auth.clientProfile?.id === clientId;

  if (!isStudent && !isClient) {
    throw new MessagingError("You are not authorized to create a conversation for this project", 403, "FORBIDDEN");
  }

  // Legitimate marketplace relationship check:
  // Must have an existing application or work contract
  const [application, workContract] = await Promise.all([
    prisma.application.findUnique({
      where: {
        projectId_studentId: {
          projectId,
          studentId: studentProfileId,
        },
      },
    }),
    prisma.workContract.findFirst({
      where: {
        projectId,
        studentId: studentProfileId,
      },
    }),
  ]);

  if (!application && !workContract) {
    throw new MessagingError(
      "A legitimate application or contract relationship is required to initiate messaging",
      403,
      "NO_MARKETPLACE_RELATION"
    );
  }

  // Find or create conversation atomically
  let conversation = await prisma.conversation.findUnique({
    where: {
      studentId_clientId_projectId: {
        studentId: studentProfileId,
        clientId,
        projectId,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        studentId: studentProfileId,
        clientId,
        projectId,
      },
    });
  }

  return getConversation(conversation.id, auth);
}

export async function listMessages(
  conversationId: string,
  auth: AuthenticatedUser,
  options?: { limit?: number; before?: string }
) {
  // Verify authorization
  await getConversation(conversationId, auth);

  const limit = Math.min(options?.limit || 50, 100);

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(options?.before ? { createdAt: { lt: new Date(options.before) } } : {}),
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return messages.map((m) => {
    const isCurrentUser = m.senderId === auth.user.id;
    // Map sender role for the frontend ("student" | "client")
    const senderRole = m.sender.role === UserRole.STUDENT ? "student" : "client";

    return {
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      sender: senderRole as "student" | "client",
      senderName: m.sender.name,
      isSelf: isCurrentUser,
      content: m.content,
      timestamp: formatTime(new Date(m.createdAt)),
      createdAt: m.createdAt.toISOString(),
      status: (m.readAt ? "read" : "sent") as "read" | "sent",
      attachment: m.attachmentName
        ? {
            id: `att_${m.id}`,
            name: m.attachmentName,
            size: m.attachmentSize || undefined,
            url: m.attachmentUrl
              ? m.attachmentUrl.startsWith("http") || m.attachmentUrl.startsWith("/api/files/")
                ? m.attachmentUrl
                : `/api/files/${m.attachmentUrl}/download?redirect=true`
              : undefined,
          }
        : undefined,
    };
  });
}

export async function sendMessage(
  conversationId: string,
  auth: AuthenticatedUser,
  data: {
    content: string;
    attachmentName?: string;
    attachmentSize?: string;
    attachmentUrl?: string;
  }
) {
  // Verify participant authorization
  await getConversation(conversationId, auth);

  const trimmed = (data.content || "").trim();
  if (!trimmed && !data.attachmentName) {
    throw new MessagingError("Message content or attachment is required", 400, "EMPTY_MESSAGE");
  }

  if (trimmed.length > 5000) {
    throw new MessagingError("Message exceeds maximum length of 5000 characters", 400, "MESSAGE_TOO_LONG");
  }

  // Create message and touch conversation updatedAt
  const [createdMessage] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: auth.user.id, // Strictly server session derived!
        content: trimmed,
        attachmentName: data.attachmentName ? data.attachmentName.trim().slice(0, 255) : null,
        attachmentSize: data.attachmentSize ? data.attachmentSize.trim().slice(0, 50) : null,
        attachmentUrl: data.attachmentUrl ? data.attachmentUrl.trim().slice(0, 1000) : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  const senderRole = createdMessage.sender.role === UserRole.STUDENT ? "student" : "client";

  return {
    id: createdMessage.id,
    conversationId: createdMessage.conversationId,
    senderId: createdMessage.senderId,
    sender: senderRole as "student" | "client",
    senderName: createdMessage.sender.name,
    isSelf: true,
    content: createdMessage.content,
    timestamp: formatTime(new Date(createdMessage.createdAt)),
    createdAt: createdMessage.createdAt.toISOString(),
    status: "sent" as const,
    attachment: createdMessage.attachmentName
      ? {
          id: `att_${createdMessage.id}`,
          name: createdMessage.attachmentName,
          size: createdMessage.attachmentSize || undefined,
          url: createdMessage.attachmentUrl || undefined,
        }
      : undefined,
  };
}

export async function markConversationRead(conversationId: string, auth: AuthenticatedUser) {
  // Verify participant authorization
  await getConversation(conversationId, auth);

  // Mark all unread messages from OTHER participants as read
  const result = await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: auth.user.id },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return { updated: result.count };
}
