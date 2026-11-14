// Autochequeo del código vendorizado: si una actualización de remotion rompe una
// firma, esto falla antes de que falle un video.
import {makeArrow} from "./make-arrow";
import {makeCallout} from "./make-callout";
import {makeCircle} from "./make-circle";
import {makeEllipse} from "./make-ellipse";
import {makeHeart} from "./make-heart";
import {makePie} from "./make-pie";
import {makeRect} from "./make-rect";
import {makeSpark} from "./make-spark";
import {makeTriangle} from "./make-triangle";

const piezas = {
  arrow: makeArrow({
    length: 100,
    headWidth: 40,
    headLength: 40,
    shaftWidth: 20,
    strokeWidth: 4,
  }),
  callout: makeCallout({width: 200, height: 100, pointerLength: 30}),
  circle: makeCircle({radius: 50}),
  ellipse: makeEllipse({rx: 80, ry: 40}),
  heart: makeHeart({height: 100}),
  pie: makePie({radius: 50, progress: 0.5}),
  rect: makeRect({width: 100, height: 60}),
  spark: makeSpark({width: 200, height: 200}),
  triangle: makeTriangle({width: 100, length: 100}),
};

for (const [nombre, info] of Object.entries(piezas)) {
  if (!info.path.startsWith("M")) throw new Error(`${nombre}: path inválido`);
  if (!(info.width > 0 && info.height > 0)) throw new Error(`${nombre}: medidas en cero`);
}

console.log(`${Object.keys(piezas).length} formas vendorizadas OK`);
