"use client";

import { Container } from "@/components/layout";
import { HeroCopy } from "./copy";
import { ProductVisual } from "./product-visual";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-10 md:pt-16 pb-20">
      <Container size="xl" className="h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-4 items-center h-full">
          {/* Left Column: Copy */}
          <div className="order-2 lg:order-1 flex items-center h-full">
            <HeroCopy />
          </div>

          {/* Right Column: Product Visual */}
          <div className="order-1 lg:order-2 flex items-center justify-center h-full relative z-0">
            <ProductVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
