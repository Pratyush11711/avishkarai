"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = { failed: boolean };

/** Keeps one section from taking down the rest of the page. */
export class SectionBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
