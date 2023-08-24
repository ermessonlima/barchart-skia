import {
  Canvas,
  DashPathEffect,
  Path,
  Skia,
  Text,
  useFont,
  useValue,
} from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import * as d3 from "d3";

interface DataPoint {
  label: string;
  value: number;
}

const data: DataPoint[] = [
  { label: "Erro Tipo 3", value: 9 },
  { label: "Erro Tipo 2", value: 7 },
  { label: "Sem Erros", value: 6 },
  { label: "Erro Tipo 4", value: 5 },
  { label: "Erro Tipo 5", value: 4 },
  { label: "Erro Tipo 1", value: 3 },
  { label: "Erro Tipo 6", value: 2 },
];

const GRAPH_MARGIN = 10;
const GRAPH_BAR_WIDTH = 30;

const CanvasHeight = 380;
const CanvasWidth = 400;
const graphHeight = CanvasHeight - 2 * GRAPH_MARGIN;
const graphWidth = CanvasWidth - 5 * GRAPH_MARGIN - 40;

const MAX_BAR_HEIGHT = 30;
const MIN_BAR_HEIGHT = 5;
const SPACING_BETWEEN_BARS = 5;
const availableSpace = graphHeight - data.length * SPACING_BETWEEN_BARS;

export default function App() {
  const dynamicBarHeight = Math.max(
    Math.min(availableSpace / data.length, MAX_BAR_HEIGHT),
    MIN_BAR_HEIGHT
  );

  const font = useFont(require("./Roboto-Bold.ttf"), 10);
  const animationState = useValue(1);

  const xDomain = data.map((dataPoint: DataPoint) => dataPoint.label);
  const xRange = [0, graphHeight];
  const x = d3.scalePoint().domain(xDomain).range(xRange).padding(0.5);

  const maxDataValue = d3.max(
    data,
    (yDataPoint: DataPoint) => yDataPoint.value
  )!;
  const yDomain: number[] = [
    0,
    maxDataValue % 2 === 0 ? maxDataValue : maxDataValue + 1,
  ];

  const TEXT_OFFSET = 60;
  const yRange = [0, graphWidth];
  const y = d3.scaleLinear().domain(yDomain).range(yRange);

  const [currentAnimatedHeight, setCurrentAnimatedHeight] = useState(0);

  useEffect(() => {
    const animationDuration = 1600;
    const animationStart = Date.now();

    const animateHeight = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - animationStart;

      if (elapsedTime >= animationDuration) {
        setCurrentAnimatedHeight(1);
        return;
      }

      const animationProgress = elapsedTime / animationDuration;
      setCurrentAnimatedHeight(animationProgress);

      requestAnimationFrame(animateHeight);
    };

    animateHeight();
  }, []);

  const pathElements = data.map((dataPoint: DataPoint, index: number) => {
    const newPath = Skia.Path.Make();
    const rectHeight = y(dataPoint.value * 1);
    const rectX = TEXT_OFFSET + 10;
    const rectY = x(dataPoint.label)! - GRAPH_BAR_WIDTH / 2;
    console.log(animationState.current);
    const animatedRectHeight = rectHeight * currentAnimatedHeight;

    newPath.addRect(
      Skia.XYWHRect(rectX, rectY, animatedRectHeight, dynamicBarHeight)
    );

    return (
      <>
        <Path
          key={`bar-${index}`}
          path={newPath}
          color={getColorForIndex(index)}
        />
        <Text
          key={`value-${index}`}
          font={font}
          x={rectX + rectHeight / 2}
          y={rectY + GRAPH_BAR_WIDTH / 2}
          text={String(dataPoint.value)}
          color="white"
        />
      </>
    );
  });

  if (!font) {
    return <View />;
  }

  function getColorForIndex(index: number): string {
    return index % 2 === 0 ? "#2670E8" : "#0C326F";
  }

  function createHorizontalDashedLine(yPos: number) {
    const path = Skia.Path.Make();
    const line = Skia.XYWHRect(TEXT_OFFSET + 10, yPos, graphWidth, 0.5);
    path.addRect(line);
    return (
      <Path
        key={`h-line-${yPos}`}
        path={path}
        color="#BDBDBD"
        style="stroke"
        strokeWidth={1}
      >
        <DashPathEffect intervals={[10, 1]} />
      </Path>
    );
  }

  function createVerticalDashedLine(yValue: number) {
    const path = Skia.Path.Make();
    const lineXPosition = TEXT_OFFSET + 10 + y(yValue);
    const line = Skia.XYWHRect(lineXPosition, 0, 0.5, graphHeight);
    path.addRect(line);
    return (
      <Path
        key={`v-line-${lineXPosition}`}
        path={path}
        strokeWidth={0.5}
        color="#BDBDBD"
        style="stroke"
      >
        <DashPathEffect intervals={[10, 1]} />
      </Path>
    );
  }

  function createBottomLine() {
    const path = Skia.Path.Make();
    const line = Skia.XYWHRect(
      TEXT_OFFSET + 10,
      CanvasHeight - 20,
      graphWidth,
      0.5
    );
    path.addRect(line);
    return (
      <Path
        key="bottom-line"
        path={path}
        color="#BDBDBD"
        style="stroke"
        strokeWidth={1}
      >
        <DashPathEffect intervals={[10, 1]} />
      </Path>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        {data.map((dataPoint: DataPoint) => (
          <Text
            key={dataPoint.label}
            font={font}
            x={TEXT_OFFSET - 50}
            y={x(dataPoint.label)! - GRAPH_BAR_WIDTH / 2 + GRAPH_BAR_WIDTH / 2}
            text={dataPoint.label}
          />
        ))}
        {createBottomLine()}
        {Array.from({ length: yDomain[1] + 1 }).map((_, i) => {
          if (i % 2 === 0) {
            return (
              <Text
                key={`number-${i}`}
                font={font}
                x={TEXT_OFFSET + 10 + y(i)}
                y={CanvasHeight - 10}
                text={String(i)}
              />
            );
          }
        })}

        {Array.from({ length: Math.floor(yDomain[1] / 2) + 1 }).map((_, i) => {
          const value = i * 2;
          return (
            <>
              <Text
                key={`number-${value}`}
                font={font}
                x={TEXT_OFFSET + 10 + y(value)}
                y={CanvasHeight - 10}
                text={String(value)}
              />
              {createHorizontalDashedLine(y(value))}
            </>
          );
        })}

        {Array.from({ length: yDomain[1] + 1 }).map((_, i) => {
          if (i % 2 === 0) {
            return createVerticalDashedLine(i);
          }
        })}
        {pathElements}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
  },
  canvas: {
    height: CanvasHeight,
    width: CanvasWidth,
  },
});
