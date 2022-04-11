/* eslint-env jest */
import { screen, render } from "@testing-library/react";
import React from "react";
import { DQNode } from "../models/dq-node";
import { DQRoot } from "../models/dq-root";
import { GenericContainer } from "../models/test-utils";
import { Variable } from "../models/variable";
import { Diagram } from "./diagram";


beforeAll(() => {
  // Setup ResizeObserver and offset* properties
  // see: https://github.com/wbkd/react-flow/issues/716
  window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));

  Object.defineProperties(window.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  (window.SVGElement as any).prototype.getBBox = () => ({x:0, y:0, width: 0, height: 0});
});

it("should render", async () => {
  const variable = Variable.create({});
  const root = DQRoot.create();
  const node = DQNode.create({ variable: variable.id, x: 0, y: 0 });
  root.addNode(node);
  // references have to be within the same tree so we need some container
  const container = GenericContainer.create();
  container.add(variable);
  container.add(root);
  render(<Diagram dqRoot={root} />);
  expect(screen.getByTestId("diagram")).toBeInTheDocument();
});
