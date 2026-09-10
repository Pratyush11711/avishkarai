import {CatmullRomCurve3,Vector3} from './vendor/three.module.js';
export const flightPath=new CatmullRomCurve3([
 new Vector3(9,-7,22),new Vector3(4,-3,13),new Vector3(.3,-.15,6.8),new Vector3(0,.08,3.1),new Vector3(.07,.08,-1.1),new Vector3(-.06,.13,-5.8),new Vector3(0,.18,-9.4),new Vector3(0,.3,-12.8),new Vector3(0,1.1,-24),new Vector3(1.3,3,-56),new Vector3(3.3,5.2,-115)
],false,'catmullrom',.22);
