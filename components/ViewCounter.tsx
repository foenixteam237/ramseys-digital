"use client";

import { useEffect, useRef } from "react";
import { registerPostViewAction } from "@/app/blog/blog-actions";

export default function ViewCounter({ postId }: { postId: string }) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    registerPostViewAction(postId).catch(() => {});
  }, [postId]);

  return null;
}
