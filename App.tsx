import React, { useState } from "react";
import { Button, ScrollView, StyleSheet, View } from "react-native";
import { Canvas, Path, Skia, Text, useFont } from "@shopify/react-native-skia";
import Barra from "./barras";

const CanvasWidth = 400;
const CanvasHeight = 400;

interface IData {
  name: string;
  value: number;
}

const data: IData[] = [
  { name: "Abaixo do básico", value: 7 },
  { name: "Avançado", value: 10 },
  { name: "Básico", value: 10 },
  { name: "Adequado", value: 10 },
];

export default function App() {
  const font = useFont(require("./Roboto-Bold.ttf"), 14);

  const [treeData, setTreeData] = useState(data);

  function generateRandomData() {
    setTreeData((prevData) => {
      return prevData.map((item) => {
        if (item.name === "Avançado") {
          return {
            ...item,
            value: Math.max(5, Math.floor(Math.random() * 11)),
          };
        }
        return {
          ...item,
          value: Math.floor(Math.random() * 11),
        };
      });
    });
  }

  if (!font) {
    return <View />;
  }

  const layouts = calculateLayouts(treeData);
  const borderWidth = 2;
  const treemapElements = layouts.map((layout, index) => {
    const { x, y, width, height } = layout;
    const rectPath = Skia.Path.Make();
    rectPath.addRect(Skia.XYWHRect(x, y, width, height));

    const outerRectPath = Skia.Path.Make();
    outerRectPath.addRect(Skia.XYWHRect(x, y, width, height));

    const innerRectPath = Skia.Path.Make();
    innerRectPath.addRect(
      Skia.XYWHRect(
        x + borderWidth,
        y + borderWidth,
        width - 2 * borderWidth,
        height - 2 * borderWidth
      )
    );
    const shouldRotate = index === 0 && data[0].value === 1;

    const xPos = shouldRotate
      ? y + height / 20
      : index >= 2
      ? y + height / 20
      : x + 15;
    const yPos = shouldRotate ? -(x + 8) : index >= 2 ? -(x + 8) : y + 25;

    return (
      <>
        <Path
          key={`outer-rect-${index}`}
          path={outerRectPath}
          color={"white"}
        />
        <Path
          key={`inner-rect-${index}`}
          path={innerRectPath}
          color={getColorForNode(index)}
        />
        <Text
          key={`label-${index}`}
          font={font}
          x={
            index >= 2
              ? y + height / 20
              : index === 0 && treeData[index].value < 10
              ? x + 15
              : x + 15
          }
          y={
            index >= 2
              ? -(x + 8)
              : index === 0 && treeData[index].value < 10
              ? y - 10
              : y + 25
          }
          text={treeData[index].name}
          color={"white"}
          transform={
            index >= 2
              ? [{ rotate: Math.PI / 2 }]
              : index === 0 && treeData[index].value < 10
              ? [{ rotate: 1.56 }]
              : []
          }
        />
      </>
    );
  });

  return (
    <ScrollView style={styles.container}>
      <Canvas style={styles.canvas}>{treemapElements}</Canvas>
      <Button title="Gerar Dados Aleatórios" onPress={generateRandomData} />
      <Barra />
      <View
        style={{
          height: 400,
        }}
      ></View>
    </ScrollView>
  );
}

function calculateLayouts(data: IData[]) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const verticalBarWidth = CanvasWidth * (data[0].value / totalValue);
  const remainingWidth = CanvasWidth - verticalBarWidth;

  const horizontalBarHeight = CanvasHeight * (data[1].value / totalValue);
  const twoVerticalBarsHeight = CanvasHeight - horizontalBarHeight;

  const cWidth =
    remainingWidth * (data[2].value / (data[2].value + data[3].value));
  const dWidth = remainingWidth - cWidth;

  return [
    { x: 0, y: 0, width: verticalBarWidth, height: CanvasHeight },
    {
      x: verticalBarWidth,
      y: CanvasHeight - horizontalBarHeight,
      width: remainingWidth,
      height: horizontalBarHeight,
    },
    {
      x: verticalBarWidth,
      y: CanvasHeight - horizontalBarHeight - twoVerticalBarsHeight,
      width: cWidth,
      height: twoVerticalBarsHeight,
    },
    {
      x: verticalBarWidth + cWidth,
      y: CanvasHeight - horizontalBarHeight - twoVerticalBarsHeight,
      width: dWidth,
      height: twoVerticalBarsHeight,
    },
  ];
}

function getColorForNode(index: number) {
  const colors = ["#ff0000", "#154C21", "#e6000088", "#168821"];
  return colors[index % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 150,
    padding: 10,
  },
  canvas: {
    height: CanvasHeight,
    width: CanvasWidth,
  },
});
