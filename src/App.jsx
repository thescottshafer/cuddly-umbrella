import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSupabase } from "./useSupabase.js";

function calcTask(task, milestoneRate, w2, sub, units, assignedRate) {
  const H=milestoneRate, L=w2, M=sub, O=task.revPct;
  const subRate=H*M*O, w2Pay=H*L*O;
  const eeRate=(assignedRate!=null)?assignedRate:task.templateEeRate;
  const uhr=(w2Pay>0)?eeRate/w2Pay:0;
  const loadForecast=(uhr>0&&units!=null)?units/uhr:null;
  return {subRate,w2Pay,eeRate,uhr,loadForecast};
}

const RATE_CARD = [{"customer":"BAM Broadband","program":"BAM Engineering CO","milestones":[{"name":"HLD Initial - Design","masterRate":60.99,"milestonePct":0.2,"milestoneRate":12.198,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design Creation in Vetro","revPct":0.75,"rdbTask":"Design/FIBER DESIGN","templateEeRate":40.0},{"name":"QC & Submit","revPct":0.2,"rdbTask":"Quality Control/FINAL HLD QA","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Management","templateEeRate":64.0}]},{"name":"HLD Final - Design","masterRate":60.99,"milestonePct":0.2,"milestoneRate":12.198,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design Creation in Vetro","revPct":0.75,"rdbTask":"Design/FINAL DESIGN POSTING IN VETRO","templateEeRate":40.0},{"name":"QC & Submit","revPct":0.2,"rdbTask":"Quality Control/FINAL QA","templateEeRate":43.77},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Management","templateEeRate":64.0}]},{"name":"Plan Set Prelim - Design","masterRate":60.99,"milestonePct":0.4,"milestoneRate":24.39,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design Creation in AutoCAD","revPct":0.75,"rdbTask":"Permitting/PLAN VIEW CREATION","templateEeRate":37.0},{"name":"QC & Submit","revPct":0.2,"rdbTask":"Quality Control/FINAL QA","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Management","templateEeRate":64.0}]},{"name":"Plan Set Final - Design","masterRate":60.99,"milestonePct":0.2,"milestoneRate":12.198,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design Creation in AutoCAD","revPct":0.75,"rdbTask":"Design/LLD ROUTE FINALIZAITON AND UPDATES","templateEeRate":37.0},{"name":"QC & Submit","revPct":0.2,"rdbTask":"Quality Control/FINAL QA","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Management","templateEeRate":64.0}]}]},{"customer":"Brightspeed","program":"Brightspeed FTTH ENG-KS","milestones":[{"name":"Design Verification - UG/Buried","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/Permit Research","templateEeRate":42.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Aerial Field Notes","templateEeRate":45.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Design Verification - Aerial","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/JU Research","templateEeRate":42.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Buried/UG Field notes","templateEeRate":45.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple Aerial","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"JU Application","revPct":0.25,"rdbTask":"Permitting/JU Application","templateEeRate":42.0},{"name":"HOA / Katapult","revPct":0.2,"rdbTask":"Permitting/Katapult Calibrate or Heights","templateEeRate":43.0},{"name":"Permit Prints","revPct":0.3,"rdbTask":"Permitting/Permit Prints","templateEeRate":37.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":42.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":42.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple UG/Buried","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Prints","revPct":0.65,"rdbTask":"Permitting/Permit Prints","templateEeRate":37.0},{"name":"QC","revPct":0.05,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":38.0},{"name":"Follow-up to Approval","revPct":0.15,"rdbTask":"Permitting/Permit Application","templateEeRate":43.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":43.0}]}]},{"customer":"Brightspeed","program":"Brightspeed FTTH ENG-MO","milestones":[{"name":"Design Verification - UG/Buried","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.05,"rdbTask":"Permitting/Permit Research","templateEeRate":45.0},{"name":"Fielding","revPct":0.55,"rdbTask":"Fielding/Aerial Field Notes","templateEeRate":39.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Design Verification - Aerial","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.05,"rdbTask":"Permitting/JU Research","templateEeRate":46.0},{"name":"Fielding","revPct":0.55,"rdbTask":"Fielding/Buried/UG Field notes","templateEeRate":40.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":45.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":45.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple Aerial","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"JU Application","revPct":0.25,"rdbTask":"Permitting/JU Application","templateEeRate":42.0},{"name":"HOA / Katapult","revPct":0.2,"rdbTask":"Permitting/Katapult Calibrate or Heights","templateEeRate":47.0},{"name":"Permit Prints","revPct":0.3,"rdbTask":"Permitting/Permit Prints","templateEeRate":41.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":46.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":46.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple UG/Buried","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Prints","revPct":0.65,"rdbTask":"Permitting/Permit Prints","templateEeRate":37.0},{"name":"QC","revPct":0.05,"rdbTask":"Permitting/Permit QC","templateEeRate":48.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":42.0},{"name":"Follow-up to Approval","revPct":0.15,"rdbTask":"Permitting/Permit Application","templateEeRate":47.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":47.0}]}]},{"customer":"Brightspeed","program":"Brightspeed FTTH ENG-MI","milestones":[{"name":"Design Verification - UG/Buried","masterRate":0.28,"milestonePct":1.0,"milestoneRate":0.28,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/Permit Research","templateEeRate":49.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Aerial Field Notes","templateEeRate":43.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":48.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":48.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Design Verification - Aerial","masterRate":0.28,"milestonePct":1.0,"milestoneRate":0.28,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/JU Research","templateEeRate":50.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Buried/UG Field notes","templateEeRate":44.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":49.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":49.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple Aerial","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"JU Application","revPct":0.25,"rdbTask":"Permitting/JU Application","templateEeRate":42.0},{"name":"HOA / Katapult","revPct":0.2,"rdbTask":"Permitting/Katapult Calibrate or Heights","templateEeRate":51.0},{"name":"Permit Prints","revPct":0.3,"rdbTask":"Permitting/Permit Prints","templateEeRate":45.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":50.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":50.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple UG/Buried","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Prints","revPct":0.65,"rdbTask":"Permitting/Permit Prints","templateEeRate":37.0},{"name":"QC","revPct":0.05,"rdbTask":"Permitting/Permit QC","templateEeRate":52.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":46.0},{"name":"Follow-up to Approval","revPct":0.15,"rdbTask":"Permitting/Permit Application","templateEeRate":51.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":51.0}]},{"name":"Pole Loading as required (MI ONLY)","masterRate":41.5,"milestonePct":1.0,"milestoneRate":41.5,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA Creation","revPct":0.7,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"QC","revPct":0.2,"rdbTask":"Fielding/Field QC","templateEeRate":67.0},{"name":"PLA Submission","revPct":0.05,"rdbTask":"Permitting/JU Application","templateEeRate":61.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"MR Engineering and Pole Loading - Blended (MI ONLY)","masterRate":62.5,"milestonePct":1.0,"milestoneRate":62.5,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA Creation","revPct":0.7,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"QC","revPct":0.2,"rdbTask":"Fielding/Field QC","templateEeRate":69.0},{"name":"PLA Submission","revPct":0.05,"rdbTask":"Permitting/JU Application","templateEeRate":63.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]}]},{"customer":"Brightspeed","program":"Brightspeed FTTH ENG-TX","milestones":[{"name":"Design Verification - UG/Buried","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/Permit Research","templateEeRate":53.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Aerial Field Notes","templateEeRate":47.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":52.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":52.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Design Verification - Aerial","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/JU Research","templateEeRate":54.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Buried/UG Field notes","templateEeRate":48.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":53.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":53.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple Aerial","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"JU Application","revPct":0.25,"rdbTask":"Permitting/JU Application","templateEeRate":42.0},{"name":"HOA / Katapult","revPct":0.2,"rdbTask":"Permitting/Katapult Calibrate or Heights","templateEeRate":55.0},{"name":"Permit Prints","revPct":0.3,"rdbTask":"Permitting/Permit Prints","templateEeRate":49.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":54.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":54.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple UG/Buried","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Prints","revPct":0.65,"rdbTask":"Permitting/Permit Prints","templateEeRate":37.0},{"name":"QC","revPct":0.05,"rdbTask":"Permitting/Permit QC","templateEeRate":56.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":50.0},{"name":"Follow-up to Approval","revPct":0.15,"rdbTask":"Permitting/Permit Application","templateEeRate":55.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":55.0}]}]},{"customer":"Brightspeed","program":"Brightspeed FTTH ENG-NC","milestones":[{"name":"Design Verification - UG/Buried","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/Permit Research","templateEeRate":57.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Aerial Field Notes","templateEeRate":51.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":56.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":56.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Design Verification - Aerial","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/JU Research","templateEeRate":58.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Buried/UG Field notes","templateEeRate":52.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":57.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":57.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple Aerial","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"JU Application","revPct":0.25,"rdbTask":"Permitting/JU Application","templateEeRate":42.0},{"name":"HOA / Katapult","revPct":0.2,"rdbTask":"Permitting/Katapult Calibrate or Heights","templateEeRate":59.0},{"name":"Permit Prints","revPct":0.3,"rdbTask":"Permitting/Permit Prints","templateEeRate":53.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":58.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":58.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple UG/Buried","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Prints","revPct":0.65,"rdbTask":"Permitting/Permit Prints","templateEeRate":37.0},{"name":"QC","revPct":0.05,"rdbTask":"Permitting/Permit QC","templateEeRate":60.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":54.0},{"name":"Follow-up to Approval","revPct":0.15,"rdbTask":"Permitting/Permit Application","templateEeRate":59.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":59.0}]}]},{"customer":"Brightspeed","program":"Brightspeed FTTH ENG-SC","milestones":[{"name":"Design Verification - UG/Buried","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/Permit Application","templateEeRate":61.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Aerial Field Notes","templateEeRate":55.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":60.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":60.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Design Verification - Aerial","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc GIS creation","revPct":0.1,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"Permit Requirement Research","revPct":0.2,"rdbTask":"Permitting/JU Research","templateEeRate":62.0},{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding/Buried/UG Field notes","templateEeRate":56.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":61.0},{"name":"Shape File Cleanup","revPct":0.15,"rdbTask":"Design/Construction Prints for Fiber","templateEeRate":61.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple Aerial","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"JU Application","revPct":0.25,"rdbTask":"Permitting/JU Application","templateEeRate":42.0},{"name":"HOA / Katapult","revPct":0.2,"rdbTask":"Permitting/Katapult Calibrate or Heights","templateEeRate":63.0},{"name":"Permit Prints","revPct":0.3,"rdbTask":"Permitting/Permit Prints","templateEeRate":57.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":62.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":62.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Permitting - Simple UG/Buried","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Prints","revPct":0.65,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"QC","revPct":0.05,"rdbTask":"Permitting/Permit QC","templateEeRate":64.0},{"name":"Application Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":58.0},{"name":"Follow-up to Approval","revPct":0.15,"rdbTask":"Permitting/Permit Application","templateEeRate":63.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":63.0}]}]},{"customer":"Brightspeed","program":"ALL","milestones":[{"name":"Pole Application","masterRate":89.5,"milestonePct":1.0,"milestoneRate":89.5,"uom":"Per App","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Pole App Submission","revPct":0.75,"rdbTask":"Permitting/PLA - Before & After","templateEeRate":42.0},{"name":"Follow-up to Approval","revPct":0.2,"rdbTask":"Permitting/Permit Application","templateEeRate":65.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":59.0}]},{"name":"Pole Loading as required","masterRate":40.0,"milestonePct":1.0,"milestoneRate":40.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA Creation","revPct":0.7,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"QC","revPct":0.2,"rdbTask":"Fielding/Field QC","templateEeRate":66.0},{"name":"PLA Submission","revPct":0.05,"rdbTask":"Permitting/JU Application","templateEeRate":60.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"MR Engineering and Pole Loading - Blended","masterRate":60.0,"milestonePct":1.0,"milestoneRate":60.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA Creation","revPct":0.7,"rdbTask":"Prelim/Prelims for Field","templateEeRate":40.0},{"name":"QC","revPct":0.2,"rdbTask":"Fielding/Field QC","templateEeRate":68.0},{"name":"PLA Submission","revPct":0.05,"rdbTask":"Permitting/JU Application","templateEeRate":62.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"PE Stamp","masterRate":1.0,"milestonePct":1.0,"milestoneRate":1.0,"uom":"Per Stamp","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[]},{"name":"Permit Fee","masterRate":1.0,"milestonePct":1.0,"milestoneRate":1.0,"uom":"Pass-Through","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[]}]},{"customer":"BluePeak Engineering","program":"Bluepeak ENG - OK","milestones":[{"name":"Fielding / Optimized HLD","masterRate":85.0,"milestonePct":0.3,"milestoneRate":25.5,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding Walkout","templateEeRate":45.0},{"name":"Optimized HLD","revPct":0.3,"rdbTask":"Fielding/Field QC","templateEeRate":40.0},{"name":"Landbase","revPct":0.15,"rdbTask":"Design/Base Map & Utilities","templateEeRate":40.0},{"name":"QC & Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"Permitting","masterRate":85.0,"milestonePct":0.4,"milestoneRate":34.0,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Aerial/Undergound Civil Created","revPct":0.55,"rdbTask":"Design/Civil Design","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"Aerial/JU Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Aerial/JU Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Fiber Design","masterRate":85.0,"milestonePct":0.2,"milestoneRate":17.0,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Create Fiber Design","revPct":0.8,"rdbTask":"Design/Fiber Design","templateEeRate":42.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"IFC / Vetro","masterRate":85.0,"milestonePct":0.1,"milestoneRate":8.5,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Vetro Posting","revPct":0.1,"rdbTask":"Design/Vetro-Basemap","templateEeRate":40.0},{"name":"IFC Creation","revPct":0.8,"rdbTask":"Client Operation Systems/Records Posting","templateEeRate":42.0},{"name":"QC & IFC Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0}]}]},{"customer":"BluePeak Engineering","program":"Bluepeak ENG - TX","milestones":[{"name":"Fielding / Optimized HLD","masterRate":84.0,"milestonePct":0.3,"milestoneRate":25.2,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding Walkout","templateEeRate":40.0},{"name":"Optimized HLD","revPct":0.3,"rdbTask":"Fielding/Field QC","templateEeRate":40.0},{"name":"Landbase","revPct":0.15,"rdbTask":"Design/Base Map & Utilities","templateEeRate":40.0},{"name":"QC & Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"Permitting","masterRate":84.0,"milestonePct":0.4,"milestoneRate":33.6,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Aerial/Undergound Civil Created","revPct":0.55,"rdbTask":"Design/Civil Design","templateEeRate":45.0},{"name":"QC","revPct":0.1,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"Aerial/JU Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Aerial/JU Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Fiber Design","masterRate":84.0,"milestonePct":0.2,"milestoneRate":16.8,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Create Fiber Design","revPct":0.8,"rdbTask":"Design/Fiber Design","templateEeRate":42.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"IFC / Vetro","masterRate":84.0,"milestonePct":0.1,"milestoneRate":8.4,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Vetro Posting","revPct":0.1,"rdbTask":"Design/Vetro-Basemap","templateEeRate":40.0},{"name":"IFC Creation","revPct":0.8,"rdbTask":"Client Operation Systems/Records Posting","templateEeRate":42.0},{"name":"QC & IFC Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0}]}]},{"customer":"BluePeak Engineering","program":"Bluepeak ENG - WY","milestones":[{"name":"Fielding / Optimized HLD","masterRate":89.0,"milestonePct":0.3,"milestoneRate":26.7,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.4,"rdbTask":"Fielding Walkout","templateEeRate":45.0},{"name":"Optimized HLD","revPct":0.3,"rdbTask":"Fielding/Field QC","templateEeRate":40.0},{"name":"Landbase","revPct":0.15,"rdbTask":"Design/Base Map & Utilities","templateEeRate":40.0},{"name":"QC & Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"Permitting","masterRate":89.0,"milestonePct":0.4,"milestoneRate":35.6,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Aerial/Undergound Civil Created","revPct":0.55,"rdbTask":"Design/Civil Design","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"Aerial/JU Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Aerial/JU Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Fiber Design","masterRate":89.0,"milestonePct":0.2,"milestoneRate":17.8,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Create Fiber Design","revPct":0.8,"rdbTask":"Design/Fiber Design","templateEeRate":42.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"IFC / Vetro","masterRate":89.0,"milestonePct":0.1,"milestoneRate":8.9,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Vetro Posting","revPct":0.1,"rdbTask":"Design/Vetro-Basemap","templateEeRate":40.0},{"name":"IFC Creation","revPct":0.8,"rdbTask":"Client Operation Systems/Records Posting","templateEeRate":42.0},{"name":"QC & IFC Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0}]}]},{"customer":"Boldyn Networks","program":"Boldyn Networks FTTH Eng","milestones":[{"name":"Fiber Path","masterRate":15045.0,"milestonePct":0.2,"milestoneRate":3009.0,"uom":"Total","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design","revPct":0.85,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":42.0},{"name":"QC & Submit to Customer","revPct":0.1,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Preliminary Drawings","masterRate":15045.0,"milestonePct":0.2,"milestoneRate":3009.0,"uom":"Total","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design","revPct":0.85,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":42.0},{"name":"QC & Submit to Customer","revPct":0.1,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Final Drawings","masterRate":15045.0,"milestonePct":0.2,"milestoneRate":3009.0,"uom":"Total","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design","revPct":0.85,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":42.0},{"name":"QC & Submit to Customer","revPct":0.1,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Center Line Description","masterRate":15045.0,"milestonePct":0.2,"milestoneRate":3009.0,"uom":"Total","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design","revPct":0.85,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":42.0},{"name":"QC & Submit to Customer","revPct":0.1,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Final As Building Drawing","masterRate":15045.0,"milestonePct":0.2,"milestoneRate":3009.0,"uom":"Total","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Design","revPct":0.85,"rdbTask":"Design/GIS ENTRY OF AS BUILT PLANT RECORDS","templateEeRate":42.0},{"name":"QC & Submit to Customer","revPct":0.1,"rdbTask":"Design/GIS ENTRY OF LLD DESIGN","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]}]},{"customer":"Charter","program":"Charter BAU","milestones":[{"name":"Permitting","masterRate":0.95,"milestonePct":1.0,"milestoneRate":0.95,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.6,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"Followup to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"JU Permitting","masterRate":165.0,"milestonePct":1.0,"milestoneRate":165.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.6,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"Followup to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"Walkout","masterRate":0.01,"milestonePct":1.0,"milestoneRate":0.01,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.85,"rdbTask":"Fielding/Field Notes-hourly","templateEeRate":45.0},{"name":"QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]}]},{"customer":"Charter","program":"Charter Engineering Texas","milestones":[{"name":"Permitting","masterRate":0.95,"milestonePct":1.0,"milestoneRate":0.95,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.6,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"Followup to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"JU Permitting","masterRate":165.0,"milestonePct":1.0,"milestoneRate":165.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.6,"rdbTask":"Permitting/Katapult - Heights of Attachments","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"Followup to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"Walkout","masterRate":0.01,"milestonePct":1.0,"milestoneRate":0.01,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.85,"rdbTask":"Fielding/Field Notes","templateEeRate":45.0},{"name":"QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]}]},{"customer":"FirstLight Engineering","program":"FirstLight BAU","milestones":[{"name":"Pole Survey","masterRate":22.0,"milestonePct":1.0,"milestoneRate":22.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Pole Survey","revPct":0.95,"rdbTask":"Fielding/Fielding - Poles","templateEeRate":45.0},{"name":"QC","revPct":0.05,"rdbTask":"Fielding/Field QC","templateEeRate":44.0}]},{"name":"Set up Fee","masterRate":385.0,"milestonePct":1.0,"milestoneRate":385.0,"uom":"Each","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Set up Fee","revPct":1.0,"rdbTask":"Permitting/Permit Application","templateEeRate":44.5}]}]},{"customer":"Frontier","program":"Frontier BAU","milestones":[{"name":"Fielding","masterRate":55.0,"milestonePct":1.0,"milestoneRate":55.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.3,"rdbTask":"Fielding/Field Notes","templateEeRate":45.0},{"name":"Fielding QC/Job Packet Creation","revPct":0.2,"rdbTask":"Permitting/Permit Prints","templateEeRate":44.0},{"name":"CAD Design","revPct":0.3,"rdbTask":"Design/Construction Prints","templateEeRate":136.0},{"name":"CAD QC","revPct":0.1,"rdbTask":"Design/Quality Control","templateEeRate":44.0},{"name":"Final QC/Submission","revPct":0.1,"rdbTask":"Design/Quality Control","templateEeRate":40.0}]},{"name":"Permitting","masterRate":45.0,"milestonePct":1.0,"milestoneRate":45.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.6,"rdbTask":"Design/Construction Prints","templateEeRate":45.5},{"name":"QC","revPct":0.1,"rdbTask":"Design/Quality Control","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permit Prints","templateEeRate":160.0},{"name":"Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permit Application","templateEeRate":44.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":44.0}]}]},{"customer":"Frontier","program":"Frontier BAU Permit","milestones":[{"name":"Permitting","masterRate":45.0,"milestonePct":1.0,"milestoneRate":45.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permitting Complete","revPct":1.0,"rdbTask":"Permitting/Permit Application","templateEeRate":46.0}]}]},{"customer":"Frontier","program":"Frontier FTTH-13 North","milestones":[{"name":"Design Created","masterRate":32.48,"milestonePct":1.0,"milestoneRate":32.48,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.3,"rdbTask":"Fielding/Field Notes","templateEeRate":46.5},{"name":"Fielding QC","revPct":0.05,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"HLD","revPct":0.2,"rdbTask":"Design/Design Hub","templateEeRate":208.0},{"name":"HLD QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"Final Design","revPct":0.25,"rdbTask":"Design/Design Hub","templateEeRate":40.0},{"name":"Final Design QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"Client Systems/Deliverable","revPct":0.1,"rdbTask":"Client Operation Systems/Client Systems","templateEeRate":40.0}]}]},{"customer":"Frontier","program":"Frontier FTTH-13 South","milestones":[{"name":"Design Created","masterRate":34.48,"milestonePct":1.0,"milestoneRate":34.48,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.3,"rdbTask":"Fielding/Field Notes","templateEeRate":47.0},{"name":"Fielding QC","revPct":0.05,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"HLD","revPct":0.2,"rdbTask":"Design/Design Hub","templateEeRate":232.0},{"name":"HLD QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"Final Design","revPct":0.25,"rdbTask":"Design/Design Hub","templateEeRate":40.0},{"name":"Final Design QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"Client Systems/Deliverable","revPct":0.1,"rdbTask":"Client Operation Systems/Client Systems","templateEeRate":40.0}]}]},{"customer":"Frontier","program":"Frontier FTTH - Permit","milestones":[{"name":"Permitting","masterRate":50.0,"milestonePct":1.0,"milestoneRate":50.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.4,"rdbTask":"Permitting/Permit Prints","templateEeRate":47.5},{"name":"QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.25,"rdbTask":"Permitting/Permit Prints","templateEeRate":256.0},{"name":"Permit Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":44.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management","templateEeRate":44.0}]},{"name":"JU Permitting","masterRate":50.0,"milestonePct":1.0,"milestoneRate":50.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.4,"rdbTask":"Permitting/Permit Prints","templateEeRate":48.0},{"name":"QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"Permit Creation","revPct":0.25,"rdbTask":"Permitting/Permit Prints","templateEeRate":280.0},{"name":"Permit Submission","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":44.0},{"name":"Follow-up to Approval","revPct":0.1,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management","templateEeRate":44.0}]},{"name":"Walkout","masterRate":50.0,"milestonePct":1.0,"milestoneRate":50.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.75,"rdbTask":"Fielding/Field Notes","templateEeRate":48.5},{"name":"QC","revPct":0.2,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management","templateEeRate":304.0}]}]},{"customer":"Frontier","program":"Frontier OnPrem","milestones":[{"name":"Fielding","masterRate":50.0,"milestonePct":1.0,"milestoneRate":50.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding Complete","revPct":1.0,"rdbTask":"Hourly Billing/OSP Engineer","templateEeRate":49.0}]},{"name":"Permitting","masterRate":60.0,"milestonePct":1.0,"milestoneRate":60.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Submitted","revPct":1.0,"rdbTask":"Hourly Billing/Hourly-Regular","templateEeRate":49.5}]}]},{"customer":"Frontier","program":"Frontier RDOF","milestones":[{"name":"Design Created","masterRate":0.55,"milestonePct":1.0,"milestoneRate":0.55,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.35,"rdbTask":"Fielding/Field Notes","templateEeRate":50.0},{"name":"Fielding QC","revPct":0.05,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"HLD","revPct":0.2,"rdbTask":"Design/Design Hub","templateEeRate":40.0},{"name":"HLD QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"Final Design","revPct":0.2,"rdbTask":"Design/Design Hub","templateEeRate":40.0},{"name":"Final Design QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"Client Systems/Deliverable","revPct":0.1,"rdbTask":"Client Operation Systems/Client Systems","templateEeRate":40.0}]}]},{"customer":"Frontier","program":"Frontier Records","milestones":[{"name":"Asbuilt Creation","masterRate":50.0,"milestonePct":1.0,"milestoneRate":50.0,"uom":"Hour","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Final Post in FROGS","revPct":1.0,"rdbTask":"AsBuilts/Asbuilts","templateEeRate":50.5}]}]},{"customer":"Lightpath","program":"Lightpath PA Engineering","milestones":[{"name":"Permit Plans -  Approved by Lightpath","masterRate":0.85,"milestonePct":0.706,"milestoneRate":0.6001,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Permit Polygons","revPct":0.05,"rdbTask":"Permitting/UG PERMITTING, BASIC","templateEeRate":51.0},{"name":"Design","revPct":0.1,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":44.0},{"name":"CAD Drawings","revPct":0.8,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":40.0},{"name":"QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0}]},{"name":"Permit Plans -  Approved by Agency","masterRate":0.85,"milestonePct":0.294,"milestoneRate":0.2499,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"GeoDataBase Files","revPct":1.0,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0}]}]},{"customer":"BluePeak Engineering","program":"Bluepeak Overbuild","milestones":[{"name":"Permitting","masterRate":65.0,"milestonePct":0.5,"milestoneRate":32.5,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Aerial/Undergound Civil Created","revPct":0.55,"rdbTask":"Design/Civil Design","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"Aerial/JU Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Aerial/JU Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Creation","revPct":0.1,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"Underground Permit Submission","revPct":0.05,"rdbTask":"Permitting/Permitting","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PM - Meetings/Status","templateEeRate":64.0}]},{"name":"Fiber Design","masterRate":65.0,"milestonePct":0.4,"milestoneRate":26.0,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Create Fiber Design","revPct":0.8,"rdbTask":"Design/Fiber Design","templateEeRate":42.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/Design QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/Project Management/Meetings","templateEeRate":64.0}]},{"name":"IFC / Vetro","masterRate":65.0,"milestonePct":0.1,"milestoneRate":6.5,"uom":"Passing","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Vetro Posting","revPct":0.1,"rdbTask":"Design/Vetro-Basemap","templateEeRate":40.0},{"name":"IFC Creation","revPct":0.8,"rdbTask":"Client Operation Systems/Records Posting","templateEeRate":44.0},{"name":"QC & IFC Submission","revPct":0.1,"rdbTask":"Design/Milestone Deliverable","templateEeRate":44.0}]}]},{"customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestones":[{"name":"Design Submittal","masterRate":0.66,"milestonePct":0.5,"milestoneRate":0.33,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"HLD","revPct":0.1,"rdbTask":"Design/FIBER DESIGN","templateEeRate":40.0},{"name":"Fielding","revPct":0.35,"rdbTask":"Fielding/Field Notes","templateEeRate":44.0},{"name":"Field QC","revPct":0.05,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"Design","revPct":0.42,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"Design QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.03,"rdbTask":"Project Management/Project Management","templateEeRate":64.0}]},{"name":"Permit Submitted","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.85,"rdbTask":"Design/Construction Prints","templateEeRate":40.0},{"name":"CAD QC","revPct":0.05,"rdbTask":"Design/Quality Control","templateEeRate":44.0},{"name":"Permit Submission","revPct":0.07,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.03,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Permit Approved","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Follow Up to Approval","revPct":0.9,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.1,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":44.0}]},{"name":"Pole Data Collection","masterRate":20.0,"milestonePct":1.0,"milestoneRate":20.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.85,"rdbTask":"Fielding/Fielding - Poles","templateEeRate":45.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"PLA","masterRate":56.0,"milestonePct":1.0,"milestoneRate":56.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA","revPct":0.85,"rdbTask":"Permitting/PLA - Before & After","templateEeRate":40.0},{"name":"PLA QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"As Builts","masterRate":0.05,"milestonePct":1.0,"milestoneRate":0.05,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"As built posting","revPct":0.95,"rdbTask":"AsBuilts/Asbuilts","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":44.0}]}]},{"customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestones":[{"name":"Design Submittal","masterRate":0.66,"milestonePct":0.5,"milestoneRate":0.33,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"HLD","revPct":0.1,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"Fielding","revPct":0.35,"rdbTask":"Fielding/Field Notes","templateEeRate":44.0},{"name":"Field QC","revPct":0.05,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"Design","revPct":0.42,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"Design QC","revPct":0.05,"rdbTask":"Quality Control/Design QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.03,"rdbTask":"Project Management/Project Management","templateEeRate":64.0}]},{"name":"Permit Submitted","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"CAD Prints","revPct":0.85,"rdbTask":"Design/Construction Prints","templateEeRate":40.0},{"name":"CAD QC","revPct":0.05,"rdbTask":"Design/Quality Control","templateEeRate":44.0},{"name":"Permit Submission","revPct":0.07,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.03,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Permit Approved","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Follow Up to Approval","revPct":0.9,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.1,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":44.0}]},{"name":"Pole Data Collection","masterRate":20.0,"milestonePct":1.0,"milestoneRate":20.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Fielding","revPct":0.85,"rdbTask":"Fielding/Fielding - Poles","templateEeRate":45.0},{"name":"Field QC","revPct":0.1,"rdbTask":"Fielding/Field QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"PLA","masterRate":56.0,"milestonePct":1.0,"milestoneRate":56.0,"uom":"Pole","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA","revPct":0.85,"rdbTask":"Permitting/PLA - Before & After","templateEeRate":40.0},{"name":"PLA QC","revPct":0.1,"rdbTask":"Permitting/Permit QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"As Builts","masterRate":0.05,"milestonePct":1.0,"milestoneRate":0.05,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"As built posting","revPct":0.95,"rdbTask":"AsBuilts/Asbuilts","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":44.0}]}]},{"customer":"Gigapower","program":"Gigapower-Engineering Audit","milestones":[{"name":"QC","masterRate":0.08,"milestonePct":1.0,"milestoneRate":0.08,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"QC Review","revPct":0.9,"rdbTask":"Quality Control/Internal QC","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.1,"rdbTask":"Project Management/Project Management","templateEeRate":44.0}]}]},{"customer":"Sky Fiber","program":"Sky Fiber Engineering","milestones":[{"name":"Mid Level Design - UG","masterRate":0.89,"milestonePct":0.25,"milestoneRate":0.2225,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc","revPct":0.1,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"Fielding","revPct":0.5,"rdbTask":"Fielding/FIELD DATA COLLECTION","templateEeRate":44.0},{"name":"Design","revPct":0.25,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Final Design - UG","masterRate":0.89,"milestonePct":0.2,"milestoneRate":0.178,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Final Fiber uploaded into ARC","revPct":0.5,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"UG Construction Prints","revPct":0.3,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Permit Submitted - UG","masterRate":0.89,"milestonePct":0.2,"milestoneRate":0.178,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Submit UG Permits","revPct":0.6,"rdbTask":"Permitting/Permit Prints","templateEeRate":40.0},{"name":"Follow-up to Approval","revPct":0.3,"rdbTask":"Permitting/Permit Application","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.1,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":40.0}]},{"name":"Permit Approved - UG","masterRate":0.89,"milestonePct":0.25,"milestoneRate":0.2225,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Finalize construction prints","revPct":0.8,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":40.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"As Builts - UG","masterRate":0.89,"milestonePct":0.1,"milestoneRate":0.089,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Posting to client system","revPct":0.75,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"QC ","revPct":0.2,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Mid Level Design - AER","masterRate":1.38,"milestonePct":0.25,"milestoneRate":0.345,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Arc","revPct":0.1,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"Fielding","revPct":0.5,"rdbTask":"Fielding/FIELD DATA COLLECTION","templateEeRate":44.0},{"name":"Design","revPct":0.25,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"QC","revPct":0.1,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Final Design - AER","masterRate":1.38,"milestonePct":0.2,"milestoneRate":0.276,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Final Fiber uploaded into ARC","revPct":0.5,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"UG Construction Prints","revPct":0.3,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Permit Submitted - AER","masterRate":1.38,"milestonePct":0.2,"milestoneRate":0.276,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"PLA","revPct":0.4,"rdbTask":"Permitting/AERIAL PERMITTING - BASIC","templateEeRate":40.0},{"name":"Submit AE Permits","revPct":0.3,"rdbTask":"Permitting/Permit Application","templateEeRate":44.0},{"name":"Follow-up to Approval","revPct":0.25,"rdbTask":"Permitting/Permit Application","templateEeRate":40.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"Permit Approved - AER","masterRate":1.38,"milestonePct":0.25,"milestoneRate":0.345,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Finalize construction prints","revPct":0.8,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":40.0},{"name":"QC","revPct":0.15,"rdbTask":"Design/CAD OF DESIGN/CD CREATION","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]},{"name":"As Builts - AER","masterRate":1.38,"milestonePct":0.1,"milestoneRate":0.138,"uom":"Foot","w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"name":"Posting to client system","revPct":0.75,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":40.0},{"name":"QC ","revPct":0.2,"rdbTask":"Design/FIBER DESIGN (CREATED IN GIS)","templateEeRate":44.0},{"name":"PM Closeout","revPct":0.05,"rdbTask":"Project Management/PROJECT MANAGEMENT","templateEeRate":64.0}]}]}];

const ROSTER = [{"id":"100556","name":"Harper, Kristopher B.","rate":46.0,"org":"Drafter","title":"CAD Assistant Supervisor","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101016","name":"Robison, Arianna N.","rate":31.0,"org":"Drafter","title":"CAD Assistant Supervisor","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"100434","name":"Ussery, Xavier","rate":38.0,"org":"Drafter","title":"CAD Assistant Supervisor","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101429","name":"Beaty, Melissa A.","rate":26.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101690","name":"Buck, Todd","rate":26.0,"org":"Drafter","title":"CAD Technician","location":"AR WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101313","name":"Haney, Brett D.","rate":25.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"100868","name":"Maestas, Alexis E.","rate":29.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"100758","name":"Means, Meikale A.","rate":27.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101101","name":"Monin, Ethan T.","rate":25.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101014","name":"Murphy, Mark A.","rate":25.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101623","name":"Navarrete, Luis","rate":30.0,"org":"Drafter","title":"CAD Technician","location":"NJ WFH1","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101624","name":"Raustad, Kevin","rate":31.0,"org":"Drafter","title":"CAD Technician","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101257","name":"Cacho-Sousa, Martha A.","rate":46.0,"org":"QC","title":"Quality Control Analyst","location":"CA WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100794","name":"Scallion, Lauren E.","rate":27.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101507","name":"Ward, Jessica A.","rate":28.0,"org":"Drafter","title":"CAD Technician","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"100617","name":"Williams, Alex","rate":31.0,"org":"Drafter","title":"CAD Technician","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"100979","name":"Ramey, Charles W.","rate":43.0,"org":"Designer","title":"Eng GIS Assist Supv","location":"GA WFH","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Browning, Shawn"},{"id":"100015","name":"Bronson, Charles","rate":41.0,"org":"Other","title":"Engineering Assist Supv","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"100902","name":"Doan, Tyler J.","rate":33.0,"org":"Other","title":"Engineering Assist Supv","location":"KY WFH","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100268","name":"Fulmer, Jessie","rate":31.0,"org":"Other","title":"Engineering Assist Supv","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Thomas, Cody W."},{"id":"100103","name":"Johnson, Shannon T.","rate":41.0,"org":"Other","title":"Engineering Assist Supv","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"100836","name":"Smith, Eliza C.","rate":35.0,"org":"Other","title":"Engineering Assist Supv","location":"MS WFH","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101575","name":"Colon, Francisco D.","rate":87.0,"org":"Manager","title":"Engineering Manager","location":"TX WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Bassett, Christina M."},{"id":"101499","name":"Sparkman, Ernest","rate":39.0,"org":"Other","title":"Engineering Assist Supv","location":"MS WFH","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101702","name":"Lefler, Matthew","rate":48.0,"org":"Fielder","title":"Field Eng Asst. Supv.","location":"AR Conway","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101419","name":"Alcorn, Andrew L.","rate":41.0,"org":"Fielder","title":"Field Engineer","location":"TN WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101354","name":"Brooks, Brian G.","rate":25.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"100452","name":"Castle, Harrison","rate":26.0,"org":"Fielder","title":"Field Engineer","location":"AR Conway","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"100247","name":"Church, Timothy","rate":26.0,"org":"Fielder","title":"Field Engineer","location":"AR Conway","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101520","name":"Clary, Justin M.","rate":29.0,"org":"Fielder","title":"Field Engineer","location":"TN WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101278","name":"Conerly, Brycyn C.","rate":27.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101468","name":"Hart, John A.","rate":26.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101355","name":"Hawkins, Jacob J.","rate":24.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101517","name":"McDaniel, Abiyah A.","rate":25.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101648","name":"DeVries, Timothy","rate":60.0,"org":"Manager","title":"Engineering Manager","location":"FL WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101469","name":"McDaniel, Yahchanan E.","rate":25.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101428","name":"Nall, Mary J.","rate":25.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"100759","name":"Vonreyn, Braden Z.","rate":28.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101216","name":"Whitelaw, Christopher B.","rate":37.0,"org":"Fielder","title":"Field Engineer","location":"TX WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"101369","name":"Zendragon, Louis E.","rate":25.0,"org":"Fielder","title":"Field Engineer","location":"AR WFH","taskTypes":["fielding"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"100799","name":"Hernandez, Daniel S.","rate":29.0,"org":"Designer","title":"GIS Technician","location":"NM WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Browning, Shawn"},{"id":"101603","name":"Dezso, Trevor","rate":37.0,"org":"Designer","title":"Graduate Engineer","location":"NC WFH","taskTypes":["qc","production"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"100050","name":"Acosta, Ramon","rate":44.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100370","name":"Bartlett, Benjamin F.","rate":40.0,"org":"Designer","title":"OSP Engineer","location":"NY WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"101466","name":"Bees, Caitlin J.","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"IL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100639","name":"Brown, Daniel D.","rate":44.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100076","name":"Browning, Michelle","rate":32.0,"org":"Designer","title":"OSP Engineer","location":"AR WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Thomas, Cody W."},{"id":"100078","name":"Brusilovsky, Elena","rate":44.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101487","name":"Chandler, John","rate":39.0,"org":"Designer","title":"OSP Engineer","location":"OH WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100100","name":"Chang, Han G.","rate":32.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"100079","name":"Chang, Han M.","rate":41.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100091","name":"Cominiello, Anthony C.","rate":35.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100734","name":"Costa, Matthew J.","rate":35.0,"org":"Designer","title":"OSP Engineer","location":"MA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"100405","name":"Cothren, Sidney","rate":27.0,"org":"Designer","title":"OSP Engineer","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100948","name":"Davis, Brett A.","rate":32.0,"org":"Designer","title":"OSP Engineer","location":"FL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100709","name":"De La Rosa, Xavier J.","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"FL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101515","name":"Dziadowicz, Vanessa","rate":37.0,"org":"Designer","title":"OSP Engineer","location":"NY WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100464","name":"Escalona, Jorge","rate":34.0,"org":"Designer","title":"OSP Engineer","location":"FL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"101539","name":"Haskell, Thomas J.","rate":61.0,"org":"Manager","title":"Technical Manager","location":"SC WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Sexton, Ronald G."},{"id":"100579","name":"Garcia Torres, Jorge L.","rate":42.0,"org":"Designer","title":"OSP Engineer","location":"VA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101523","name":"Gomez Jr., Nicasio","rate":30.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Thomas, Cody W."},{"id":"100654","name":"Herrmann, Isil","rate":54.0,"org":"Manager","title":"Engineering Manager","location":"MO WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101478","name":"Gridinskaya, Marina L.","rate":43.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"100097","name":"Halik, Yelena","rate":39.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100499","name":"Hickey, Kent","rate":39.0,"org":"Designer","title":"OSP Engineer","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100898","name":"Jews, Christopher L.","rate":84.0,"org":"PM","title":"Program Manager","location":"TX WFH","taskTypes":["pm"],"isSubcontractor":false,"supervisor":"Stevenson, Donald J."},{"id":"100253","name":"King, Jesse L.","rate":37.0,"org":"Designer","title":"OSP Engineer","location":"AR WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"101474","name":"Kramer, Sara J.","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"WI WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"100653","name":"Kincaid, Nicole W.","rate":44.0,"org":"Manager","title":"Engineering Manager","location":"GA WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101549","name":"Kusko Jr., David A.","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Thomas, Cody W."},{"id":"100539","name":"Laibl, Jonathan E.","rate":41.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"DeVries, Timothy"},{"id":"100199","name":"Lutrick, Tony","rate":30.0,"org":"Designer","title":"OSP Engineer","location":"LA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"100326","name":"Labar, Nicholas I.","rate":58.0,"org":"Manager","title":"Engineering Manager","location":"NY WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101612","name":"McEnnan, Alexis","rate":26.0,"org":"Designer","title":"OSP Engineer","location":"SC WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101621","name":"Miller, Melody","rate":35.0,"org":"Designer","title":"OSP Engineer","location":"FL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100657","name":"Pisano, Nicholas A.","rate":36.0,"org":"Designer","title":"OSP Engineer","location":"NY WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"DeVries, Timothy"},{"id":"101699","name":"Lehrmann, Bradley","rate":57.0,"org":"PM","title":"Project Manager","location":"MO WFH","taskTypes":["pm"],"isSubcontractor":false,"supervisor":"Jews, Christopher L."},{"id":"101159","name":"Rios, Rogelio","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Thomas, Cody W."},{"id":"100552","name":"Rodriguez, Javier G.","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Thomas, Cody W."},{"id":"100151","name":"MacKenzie, Paul","rate":58.0,"org":"Fielder","title":"Engineering Field Ops Mgr","location":"AR WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Sexton, Ronald G."},{"id":"101516","name":"Rogers Sr., Roderick E.","rate":38.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101607","name":"Singletary, Marteasha","rate":32.0,"org":"Designer","title":"OSP Engineer","location":"FL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100166","name":"Taunton, Janet","rate":31.0,"org":"Designer","title":"OSP Engineer","location":"LA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"100331","name":"Taylor, Raquel","rate":28.0,"org":"Designer","title":"OSP Engineer","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"100825","name":"Viera, Jordan R.","rate":40.0,"org":"Designer","title":"OSP Engineer","location":"MA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"DeVries, Timothy"},{"id":"100413","name":"Webb, Mike","rate":24.0,"org":"Designer","title":"OSP Engineer","location":"LA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Labar, Nicholas I."},{"id":"100685","name":"Winkler, Lisa C.","rate":27.0,"org":"Designer","title":"OSP Engineer","location":"CO WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101692","name":"Yoho, Samuel B.","rate":40.0,"org":"Designer","title":"OSP Engineer","location":"GA WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"100555","name":"Zorina, Marina N.","rate":37.0,"org":"Designer","title":"OSP Engineer","location":"TX WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"101680","name":"Burnham, Cheyenne","rate":25.0,"org":"Permitting","title":"Permit Administrator","location":"TX Fort Worth","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101650","name":"Kennedy, Jennie M.","rate":25.0,"org":"Permitting","title":"Permit Administrator","location":"TX Fort Worth","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101660","name":"Long, Dusty","rate":26.0,"org":"Permitting","title":"Permit Administrator","location":"AR WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101671","name":"Miller, Hannah","rate":23.0,"org":"Permitting","title":"Permit Administrator","location":"AR Conway","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101654","name":"Payne, Sheila A.","rate":26.0,"org":"Permitting","title":"Permit Administrator","location":"AR Conway","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101465","name":"Boeving, Emily R.","rate":33.0,"org":"Permitting","title":"Permitting Assist Supv","location":"AR Conway","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101566","name":"Deadmond, Kristy L.","rate":37.0,"org":"Permitting","title":"Permitting Assist Supv","location":"OK WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"100805","name":"Evans, Ashlee B.","rate":36.0,"org":"Permitting","title":"Permitting Assist Supv","location":"AR Conway","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"100102","name":"Newman, Scott R.","rate":52.0,"org":"Permitting","title":"Permit Manager","location":"OK WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Bassett, Christina M."},{"id":"101604","name":"Bird, Anna","rate":33.0,"org":"Permitting","title":"Permitting Coordinator","location":"CO WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"100214","name":"Brandao, Laura","rate":29.0,"org":"Permitting","title":"Permitting Coordinator","location":"LA WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101602","name":"Campbell, Anna-Marie","rate":32.0,"org":"Permitting","title":"Permitting Coordinator","location":"UT WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101601","name":"Canoy, Leah","rate":31.0,"org":"Permitting","title":"Permitting Coordinator","location":"PA WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101526","name":"Portillo, Martin A.","rate":58.0,"org":"PM","title":"Project Manager","location":"TX WFH","taskTypes":["pm"],"isSubcontractor":false,"supervisor":"Shafer, Scott A."},{"id":"101682","name":"Davis, Briana F.","rate":32.0,"org":"Permitting","title":"Permitting Coordinator","location":"TX WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101580","name":"McGee, Faith E.","rate":35.0,"org":"Permitting","title":"Permitting Coordinator","location":"TX WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101528","name":"Ramey, Christina N.","rate":31.0,"org":"Permitting","title":"Permitting Coordinator","location":"GA WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101606","name":"Reyes, Deserae","rate":37.0,"org":"Permitting","title":"Permitting Coordinator","location":"TX WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101295","name":"Raustad, Victoria M.","rate":40.0,"org":"QC","title":"Quality Control Analyst","location":"CO WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"DeVries, Timothy"},{"id":"101545","name":"Sanchez-Chavez, Stephanie","rate":34.0,"org":"Permitting","title":"Permitting Coordinator","location":"NV WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101605","name":"Thibodeaux, Myeasha","rate":35.0,"org":"Permitting","title":"Permitting Coordinator","location":"MI WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101572","name":"Woodhouse, Kelli","rate":35.0,"org":"Permitting","title":"Permitting Coordinator","location":"IL WFH","taskTypes":["permitting"],"isSubcontractor":false,"supervisor":"Newman, Scott R."},{"id":"101698","name":"Blankenship, David T.","rate":31.0,"org":"Drafter","title":"Pole Specialist","location":"KY WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"100092","name":"Bronson, Candalyn","rate":24.0,"org":"Drafter","title":"Pole Specialist","location":"AR WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"101629","name":"Dennis, Glenn","rate":38.0,"org":"Drafter","title":"Pole Specialist","location":"FL WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"100557","name":"Donnell, Ryan M.","rate":26.0,"org":"Drafter","title":"Pole Specialist","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"101665","name":"Hibbs, Gabriel T.","rate":31.0,"org":"Drafter","title":"Pole Specialist","location":"AR WFH","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"100500","name":"Sanders, Aaron","rate":45.0,"org":"PM","title":"Project Manager","location":"AR Conway","taskTypes":["pm"],"isSubcontractor":false,"supervisor":"Jews, Christopher L."},{"id":"100700","name":"Lammers, Benjamin P.","rate":23.0,"org":"Drafter","title":"Pole Specialist","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"101652","name":"Shobe, Emma","rate":36.0,"org":"QC","title":"Quality Control Analyst","location":"TX WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"DeVries, Timothy"},{"id":"100863","name":"Mentz, Ethan L.","rate":23.0,"org":"Drafter","title":"Pole Specialist","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"100152","name":"Singleton, Cody","rate":69.0,"org":"Manager","title":"Director, Engineering","location":"AR Conway","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Sexton, Ronald G."},{"id":"101647","name":"Sink, Shannon K.","rate":54.0,"org":"PM","title":"Project Manager","location":"NC WFH","taskTypes":["pm"],"isSubcontractor":false,"supervisor":"Jews, Christopher L."},{"id":"101360","name":"Reynolds, Jared E.","rate":27.0,"org":"Drafter","title":"Pole Specialist","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"101330","name":"Smith, Tate R.","rate":64.0,"org":"PM","title":"Sr Project Manager","location":"AR Conway","taskTypes":["pm"],"isSubcontractor":false,"supervisor":"Shafer, Scott A."},{"id":"100211","name":"Snow, Krystal","rate":26.0,"org":"Drafter","title":"Pole Specialist","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"100909","name":"Welter, Elizabeth R.","rate":27.0,"org":"Drafter","title":"Pole Specialist","location":"AR Conway","taskTypes":["production"],"isSubcontractor":false,"supervisor":"Colon, Francisco D."},{"id":"101697","name":"Arango Ventura, Henry","rate":37.0,"org":"QC","title":"Quality Control Analyst","location":"AZ WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Haskell, Thomas J."},{"id":"101651","name":"Ericsson, Lauryn N.","rate":36.0,"org":"QC","title":"Quality Control Analyst","location":"TX WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"DeVries, Timothy"},{"id":"101686","name":"Gosturani, Elgita","rate":37.0,"org":"QC","title":"Quality Control Analyst","location":"NY WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"101691","name":"Portorreal, Sir W.","rate":40.0,"org":"QC","title":"Quality Control Analyst","location":"FL WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"101373","name":"Thomas, Cody W.","rate":46.0,"org":"Manager","title":"Engineering Manager","location":"TX WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Singleton, Cody"},{"id":"101336","name":"Thomas, Garrett J.","rate":39.0,"org":"QC","title":"Quality Control Analyst","location":"TX Fort Worth","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Herrmann, Isil"},{"id":"101389","name":"Turner, Steve A.","rate":43.0,"org":"QC","title":"Quality Control Analyst","location":"TX WFH","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"MacKenzie, Paul"},{"id":"100066","name":"Zendragon, Nichole R.","rate":36.0,"org":"QC","title":"Quality Control Analyst","location":"AR Conway","taskTypes":["qc"],"isSubcontractor":false,"supervisor":"Kincaid, Nicole W."},{"id":"SUB001","name":"SIRIUS TECHNICAL SERVICES","rate":24.0,"org":"Subcontractor","title":"SUBCONTRACTOR","location":"TX","taskTypes":["production","fielding"],"isSubcontractor":true,"supervisor":"Shafer, Scott A."},{"id":"SUB002","name":"INTEGRA DESIGN GROUP","rate":23.0,"org":"Subcontractor","title":"SUBCONTRACTOR","location":"IL","taskTypes":["production","fielding"],"isSubcontractor":true,"supervisor":"Shafer, Scott A."},{"id":"SUB003","name":"FIBERSTAFF","rate":21.0,"org":"Subcontractor","title":"SUBCONTRACTOR","location":"FL","taskTypes":["production"],"isSubcontractor":true,"supervisor":"Shafer, Scott A."},{"id":"SUB004","name":"TERSUS SERVICES","rate":22.0,"org":"Subcontractor","title":"SUBCONTRACTOR","location":"NY","taskTypes":["production"],"isSubcontractor":true,"supervisor":"Shafer, Scott A."},{"id":"SUB005","name":"CALCOMM","rate":22.0,"org":"Subcontractor","title":"SUBCONTRACTOR","location":"CA","taskTypes":["production"],"isSubcontractor":true,"supervisor":"Shafer, Scott A."},{"id":"SUB006","name":"HARTER MANAGEMENT GROUP","rate":29.0,"org":"Subcontractor","title":"SUBCONTRACTOR","location":"GA","taskTypes":["production","fielding"],"isSubcontractor":true,"supervisor":"Shafer, Scott A."}];

const STATUS_CFG = {
  "Not Started":    {color:"#888780",bg:"#F1EFE8"},
  "In Progress":    {color:"#185FA5",bg:"#E6F1FB"},
  "Pending Review": {color:"#854F0B",bg:"#FAEEDA"},
  "Complete":       {color:"#3B6D11",bg:"#EAF3DE"},
};
const STATUS_OPTS = ["Not Started","In Progress","Pending Review","Complete"];

function rdbFlag(planned, actual) {
  if (planned==null||actual==null) return null;
  const delta=actual-planned, pct=planned>0?delta/planned:0;
  if (Math.abs(pct)<=0.1) return {label:"On Track",color:"#3B6D11",bg:"#EAF3DE",delta};
  return pct>0.1?{label:"Over",color:"#A32D2D",bg:"#FCEBEB",delta}:{label:"Under",color:"#854F0B",bg:"#FAEEDA",delta};
}

const TASK_TYPE = {
  "Design Creation in Vetro":"production",
  "QC & Submit":"qc",
  "PM Closeout":"pm",
  "Design Creation in AutoCAD":"production",
  "Arc GIS creation":"production",
  "Permit Requirement Research":"permitting",
  "Fielding":"fielding",
  "Field QC":"qc",
  "Shape File Cleanup":"production",
  "JU Application":"permitting",
  "HOA / Katapult":"production",
  "Permit Prints":"production",
  "Application Submission":"permitting",
  "Follow-up to Approval":"permitting",
  "QC":"qc",
  "Pole App Submission":"permitting",
  "PLA Creation":"production",
  "PLA Submission":"permitting",
  "Optimized HLD":"production",
  "Landbase":"production",
  "QC & Submission":"qc",
  "Aerial/Undergound Civil Created":"production",
  "Aerial/JU Permit Creation":"production",
  "Aerial/JU Permit Submission":"permitting",
  "Underground Permit Creation":"production",
  "Underground Permit Submission":"permitting",
  "Create Fiber Design":"production",
  "Vetro Posting":"production",
  "IFC Creation":"production",
  "QC & IFC Submission":"qc",
  "Design":"production",
  "QC & Submit to Customer":"pm",
  "CAD Prints":"production",
  "Permit Creation":"production",
  "Permit Submission":"permitting",
  "Followup to Approval":"permitting",
  "Pole Survey":"fielding",
  "Set up Fee":"permitting",
  "Fielding QC/Job Packet Creation":"qc",
  "CAD Design":"production",
  "CAD QC":"qc",
  "Final QC/Submission":"qc",
  "Permitting Complete":"permitting",
  "Fielding QC":"qc",
  "HLD":"production",
  "HLD QC":"qc",
  "Final Design":"production",
  "Final Design QC":"qc",
  "Client Systems/Deliverable":"production",
  "Fielding Complete":"fielding",
  "Permit Submitted":"permitting",
  "Final Post in FROGS":"production",
  "Permit Polygons":"production",
  "CAD Drawings":"production",
  "GeoDataBase Files":"production",
  "Design QC":"qc",
  "Follow Up to Approval":"permitting",
  "PLA":"permitting",
  "PLA QC":"qc",
  "As built posting":"production",
  "QC Review":"qc",
  "Arc":"production",
  "Final Fiber uploaded into ARC":"production",
  "UG Construction Prints":"production",
  "Submit UG Permits":"permitting",
  "Finalize construction prints":"production",
  "Posting to client system":"production",
  "Submit AE Permits":"permitting"
};

const TASK_TYPE_STYLE = {
  production: {label:"Production", color:"#8B2252", bg:"#FFDDEE", dot:"#FF9999"},
  qc:         {label:"QC",         color:"#2E4E6E", bg:"#D8E8F5", dot:"#8BAFD0"},
  permitting: {label:"Permitting", color:"#1A5C2A", bg:"#D6F0DC", dot:"#00B050"},
  pm:         {label:"PM",         color:"#4A2C6E", bg:"#EDE0F5", dot:"#D4BCDC"},
  fielding:   {label:"Fielding",   color:"#7A3D00", bg:"#FFF0D8", dot:"#FFC000"},
};

function getTaskType(taskName) {
  return TASK_TYPE[taskName] || "production";
}

function getEligible(taskName, roster) {
  const type = getTaskType(taskName);
  const eligible = roster.filter(r => r.taskTypes && r.taskTypes.includes(type));
  const result = eligible.length > 0 ? eligible : roster;
  return [...result].sort((a, b) => a.name.localeCompare(b.name));
}

function initials(name) {
  if (!name) return "?";
  const p=name.split(","); return ((p[1]?.trim()[0]||"")+(p[0]?.trim()[0]||"")).toUpperCase()||name[0].toUpperCase();
}
function fmtR(v) { if(v==null||isNaN(v))return"-"; return v>=1?"$"+v.toFixed(2):"$"+v.toFixed(4); }
function fmtN(v,d=2) { if(v==null||isNaN(v))return"-"; return v>=1000?v.toLocaleString(undefined,{maximumFractionDigits:d}):v.toFixed(d); }
function uid() { return Math.random().toString(36).slice(2,9); }

function recompute(p, roster) {
  const units=p.finalUnits??p.uForecast??null;
  return p.tasks.map(t=>{
    const rate=t.resource?(roster.find(r=>r.name===t.resource)?.rate??null):null;
    return {...t,...calcTask(t,p.milestoneRate,p.w2ProdTarget,p.subProdTarget,units,rate)};
  });
}

function buildProject(rc, ms, projName, uF, w2, sub) {
  const w2T=w2||ms.w2ProdTarget, subT=sub||ms.subProdTarget;
  const tasks=ms.tasks.map(t=>{
    const calc=calcTask(t,ms.milestoneRate,w2T,subT,uF??null,null);
    return {id:uid(),name:t.name,rdbtask:t.rdbTask,revPct:t.revPct,templateEeRate:t.templateEeRate,
      resource:null,ecd:null,actualDate:null,status:"Not Started",rdbHours:null,fpyScore:null,...calc};
  });
  return {id:uid(),customer:rc.customer,program:rc.program,milestone:ms.name,project:projName,
    masterRate:ms.masterRate,milestonePct:ms.milestonePct,milestoneRate:ms.milestoneRate,
    uom:ms.uom,w2ProdTarget:w2T,subProdTarget:subT,uForecast:uF??null,finalUnits:null,tasks};
}

function buildDemo() {
  // Pre-loaded from SAMPLE DATA tab of CREW_LOADING_MASTER.xlsx
  // 69 milestone rows across 6 customers: BAM Broadband (4), BluePeak Engineering (12), Brightspeed (24), Frontier (7), Hometown Internet (12), Sky Fiber (10)
  // 330 tasks total with real ECDs, RDB hours, and actual dates
  return [{"id":"Rvj7uff","customer":"BAM Broadband","program":"BAM Engineering CO","milestone":"HLD Initial - Design","project":"Aurora-115","masterRate":60.99,"milestonePct":0.2,"milestoneRate":12.198,"uom":"Passing","uForecast":338.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"NbrnTP3","name":"Design Creation in Vetro","rdbtask":"Design/FIBER DESIGN","revPct":0.75,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-18","rdbHours":24.351019874999995,"fpyScore":null,"subRate":6.403949999999999,"eeRate":40.0,"w2Pay":3.2019749999999996,"uhr":12.4922899148182,"loadForecast":27.056688749999996,"status":"Complete"},{"id":"fAbnFbm","name":"QC & Submit","rdbtask":"Quality Control/FINAL HLD QA","revPct":0.2,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.70772,"eeRate":44.0,"w2Pay":0.85386,"uhr":51.53069589862507,"loadForecast":null,"status":"Not Started"},{"id":"OHnKYaX","name":"PM Closeout","rdbtask":"Project Management/Management","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.42693,"eeRate":64.0,"w2Pay":0.213465,"uhr":299.81495795563677,"loadForecast":null,"status":"Not Started"}]},{"id":"wwmq6OL","customer":"BAM Broadband","program":"BAM Engineering CO","milestone":"HLD Final - Design","project":"Aurora-115","masterRate":60.99,"milestonePct":0.2,"milestoneRate":12.198,"uom":"Passing","uForecast":338.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"0LYTH8x","name":"Design Creation in Vetro","rdbtask":"Design/FINAL DESIGN POSTING IN VETRO","revPct":0.75,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-20","rdbHours":25.703854312499995,"fpyScore":null,"subRate":6.403949999999999,"eeRate":40.0,"w2Pay":3.2019749999999996,"uhr":12.4922899148182,"loadForecast":27.056688749999996,"status":"Complete"},{"id":"IZM1JRc","name":"QC & Submit","rdbtask":"Quality Control/FINAL QA","revPct":0.2,"templateEeRate":43.77,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.70772,"eeRate":43.77,"w2Pay":0.85386,"uhr":51.261330897336805,"loadForecast":null,"status":"Not Started"},{"id":"oreogrN","name":"PM Closeout","rdbtask":"Project Management/Management","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.42693,"eeRate":64.0,"w2Pay":0.213465,"uhr":299.81495795563677,"loadForecast":null,"status":"Not Started"}]},{"id":"CqpIqK3","customer":"BAM Broadband","program":"BAM Engineering CO","milestone":"Plan Set Prelim - Design","project":"Aurora-115","masterRate":60.99,"milestonePct":0.4,"milestoneRate":24.39,"uom":"Passing","uForecast":338.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"kTkx9NI","name":"Design Creation in AutoCAD","rdbtask":"Permitting/PLAN VIEW CREATION","revPct":0.75,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":61.41088885135135,"fpyScore":null,"subRate":12.80475,"eeRate":37.0,"w2Pay":6.402375,"uhr":5.77910541010172,"loadForecast":58.48656081081081,"status":"Complete"},{"id":"Q0Wobtq","name":"QC & Submit","rdbtask":"Quality Control/FINAL QA","revPct":0.2,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":3.4146,"eeRate":44.0,"w2Pay":1.7073,"uhr":25.771686288291455,"loadForecast":null,"status":"Not Started"},{"id":"n62tOy4","name":"PM Closeout","rdbtask":"Project Management/Management","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.85365,"eeRate":64.0,"w2Pay":0.426825,"uhr":149.944356586423,"loadForecast":null,"status":"Not Started"}]},{"id":"NgAC72q","customer":"BAM Broadband","program":"BAM Engineering CO","milestone":"Plan Set Final - Design","project":"Aurora-115","masterRate":60.99,"milestonePct":0.2,"milestoneRate":12.198,"uom":"Passing","uForecast":338.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"yn9Ffcg","name":"Design Creation in AutoCAD","rdbtask":"Design/LLD ROUTE FINALIZAITON AND UPDATES","revPct":0.75,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-19","rdbHours":35.10056918918918,"fpyScore":null,"subRate":6.403949999999999,"eeRate":37.0,"w2Pay":3.2019749999999996,"uhr":11.555368171206835,"loadForecast":29.25047432432432,"status":"Complete"},{"id":"MXAdx9G","name":"QC & Submit","rdbtask":"Quality Control/FINAL QA","revPct":0.2,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.70772,"eeRate":44.0,"w2Pay":0.85386,"uhr":51.53069589862507,"loadForecast":null,"status":"Not Started"},{"id":"81aSQHq","name":"PM Closeout","rdbtask":"Project Management/Management","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.42693,"eeRate":64.0,"w2Pay":0.213465,"uhr":299.81495795563677,"loadForecast":null,"status":"Not Started"}]},{"id":"hnuKone","customer":"Brightspeed","program":"Brightspeed FTTH ENG-KS","milestone":"Design Verification - UG/Buried","project":"KSNAEE31","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","uForecast":14178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"Fl41sNL","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":2.5307729999999995,"fpyScore":null,"subRate":0.0168,"eeRate":40.0,"w2Pay":0.0084,"uhr":4761.904761904762,"loadForecast":2.9773799999999997,"status":"Complete"},{"id":"jVHWGau","name":"Permit Requirement Research","rdbtask":"Permitting/Permit Research","revPct":0.2,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0336,"eeRate":42.0,"w2Pay":0.0168,"uhr":2500.0,"loadForecast":null,"status":"Not Started"},{"id":"b52Ztd2","name":"Fielding","rdbtask":"Fielding/Aerial Field Notes","revPct":0.4,"templateEeRate":45.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0672,"eeRate":45.0,"w2Pay":0.0336,"uhr":1339.2857142857144,"loadForecast":null,"status":"Not Started"},{"id":"6fEeVVh","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0168,"eeRate":44.0,"w2Pay":0.0084,"uhr":5238.0952380952385,"loadForecast":null,"status":"Not Started"},{"id":"DIq2AnH","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.025199999999999997,"eeRate":40.0,"w2Pay":0.012599999999999998,"uhr":3174.603174603175,"loadForecast":null,"status":"Not Started"},{"id":"Tmt9OBG","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0084,"eeRate":64.0,"w2Pay":0.0042,"uhr":15238.095238095239,"loadForecast":null,"status":"Not Started"}]},{"id":"kEnydx9","customer":"Brightspeed","program":"Brightspeed FTTH ENG-KS","milestone":"Design Verification - Aerial","project":"KSNAEE31","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","uForecast":107644.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"No41eoP","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-15","rdbHours":20.344716,"fpyScore":null,"subRate":0.0168,"eeRate":40.0,"w2Pay":0.0084,"uhr":4761.904761904762,"loadForecast":22.60524,"status":"Complete"},{"id":"ni6JDWY","name":"Permit Requirement Research","rdbtask":"Permitting/JU Research","revPct":0.2,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0336,"eeRate":42.0,"w2Pay":0.0168,"uhr":2500.0,"loadForecast":null,"status":"Not Started"},{"id":"lgAACTP","name":"Fielding","rdbtask":"Fielding/Buried/UG Field notes","revPct":0.4,"templateEeRate":45.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0672,"eeRate":45.0,"w2Pay":0.0336,"uhr":1339.2857142857144,"loadForecast":null,"status":"Not Started"},{"id":"9gyv1pl","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0168,"eeRate":44.0,"w2Pay":0.0084,"uhr":5238.0952380952385,"loadForecast":null,"status":"Not Started"},{"id":"BArp5B1","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.025199999999999997,"eeRate":40.0,"w2Pay":0.012599999999999998,"uhr":3174.603174603175,"loadForecast":null,"status":"Not Started"},{"id":"Id9Z850","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0084,"eeRate":64.0,"w2Pay":0.0042,"uhr":15238.095238095239,"loadForecast":null,"status":"Not Started"}]},{"id":"eC99enq","customer":"Brightspeed","program":"Brightspeed FTTH ENG-KS","milestone":"Permitting - Simple Aerial","project":"KSNAEE31","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","uForecast":107644.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"qWCA79I","name":"JU Application","rdbtask":"Permitting/JU Application","revPct":0.25,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-18","rdbHours":77.369125,"fpyScore":null,"subRate":0.0525,"eeRate":42.0,"w2Pay":0.02625,"uhr":1600.0,"loadForecast":67.2775,"status":"Complete"},{"id":"Sjs8JHU","name":"HOA / Katapult","rdbtask":"Permitting/Katapult Calibrate or Heights","revPct":0.2,"templateEeRate":43.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.042,"eeRate":43.0,"w2Pay":0.021,"uhr":2047.6190476190475,"loadForecast":null,"status":"Not Started"},{"id":"dKF0j7e","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.3,"templateEeRate":37.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.063,"eeRate":37.0,"w2Pay":0.0315,"uhr":1174.6031746031747,"loadForecast":null,"status":"Not Started"},{"id":"lKPoh3p","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":42.0,"w2Pay":0.0105,"uhr":3999.9999999999995,"loadForecast":null,"status":"Not Started"},{"id":"KMzKG5m","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":42.0,"w2Pay":0.0105,"uhr":3999.9999999999995,"loadForecast":null,"status":"Not Started"},{"id":"SoyPstU","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":64.0,"w2Pay":0.00525,"uhr":12190.476190476189,"loadForecast":null,"status":"Not Started"}]},{"id":"TIAae24","customer":"Brightspeed","program":"Brightspeed FTTH ENG-KS","milestone":"Permitting - Simple UG/Buried","project":"KSNAEE31","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","uForecast":14178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"522wjZR","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.65,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-20","rdbHours":26.93724202702703,"fpyScore":null,"subRate":0.1365,"eeRate":37.0,"w2Pay":0.06825,"uhr":542.1245421245421,"loadForecast":26.152662162162162,"status":"Complete"},{"id":"L9OaYsP","name":"QC","rdbtask":"Permitting/Permit QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":44.0,"w2Pay":0.00525,"uhr":8380.95238095238,"loadForecast":null,"status":"Not Started"},{"id":"6ihgIqL","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":38.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":38.0,"w2Pay":0.0105,"uhr":3619.047619047619,"loadForecast":null,"status":"Not Started"},{"id":"SmNqE40","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.15,"templateEeRate":43.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0315,"eeRate":43.0,"w2Pay":0.01575,"uhr":2730.15873015873,"loadForecast":null,"status":"Not Started"},{"id":"fAraVNq","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":43.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":43.0,"w2Pay":0.00525,"uhr":8190.47619047619,"loadForecast":null,"status":"Not Started"}]},{"id":"lu17rNy","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MO","milestone":"Design Verification - UG/Buried","project":"MOYAVV33","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","uForecast":9755.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"HZKjht3","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-15","rdbHours":1.8436949999999996,"fpyScore":null,"subRate":0.0168,"eeRate":40.0,"w2Pay":0.0084,"uhr":4761.904761904762,"loadForecast":2.0485499999999996,"status":"Complete"},{"id":"X13npgW","name":"Permit Requirement Research","rdbtask":"Permitting/Permit Research","revPct":0.05,"templateEeRate":45.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0084,"eeRate":45.0,"w2Pay":0.0042,"uhr":10714.285714285716,"loadForecast":null,"status":"Not Started"},{"id":"2zMj518","name":"Fielding","rdbtask":"Fielding/Aerial Field Notes","revPct":0.55,"templateEeRate":39.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0924,"eeRate":39.0,"w2Pay":0.0462,"uhr":844.1558441558442,"loadForecast":null,"status":"Not Started"},{"id":"Y2bTu5X","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0168,"eeRate":44.0,"w2Pay":0.0084,"uhr":5238.0952380952385,"loadForecast":null,"status":"Not Started"},{"id":"1YqWg21","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.025199999999999997,"eeRate":44.0,"w2Pay":0.012599999999999998,"uhr":3492.0634920634925,"loadForecast":null,"status":"Not Started"},{"id":"nYCsXob","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0084,"eeRate":64.0,"w2Pay":0.0042,"uhr":15238.095238095239,"loadForecast":null,"status":"Not Started"}]},{"id":"sHarAJO","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MO","milestone":"Design Verification - Aerial","project":"MOYAVV33","masterRate":0.24,"milestonePct":1.0,"milestoneRate":0.24,"uom":"Foot","uForecast":95277.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"8H6h8l7","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-19","rdbHours":19.007761499999994,"fpyScore":null,"subRate":0.0168,"eeRate":40.0,"w2Pay":0.0084,"uhr":4761.904761904762,"loadForecast":20.008169999999996,"status":"Complete"},{"id":"qgATtLF","name":"Permit Requirement Research","rdbtask":"Permitting/JU Research","revPct":0.05,"templateEeRate":46.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0084,"eeRate":46.0,"w2Pay":0.0042,"uhr":10952.380952380952,"loadForecast":null,"status":"Not Started"},{"id":"xJpRa5H","name":"Fielding","rdbtask":"Fielding/Buried/UG Field notes","revPct":0.55,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0924,"eeRate":40.0,"w2Pay":0.0462,"uhr":865.8008658008658,"loadForecast":null,"status":"Not Started"},{"id":"SUPwePu","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":45.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0168,"eeRate":45.0,"w2Pay":0.0084,"uhr":5357.142857142858,"loadForecast":null,"status":"Not Started"},{"id":"t0Sstzy","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":45.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.025199999999999997,"eeRate":45.0,"w2Pay":0.012599999999999998,"uhr":3571.428571428572,"loadForecast":null,"status":"Not Started"},{"id":"shA6P3M","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0084,"eeRate":64.0,"w2Pay":0.0042,"uhr":15238.095238095239,"loadForecast":null,"status":"Not Started"}]},{"id":"9K63LSF","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MO","milestone":"Permitting - Simple Aerial","project":"MOYAVV33","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","uForecast":95277.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"CBnD3Xk","name":"JU Application","rdbtask":"Permitting/JU Application","revPct":0.25,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":62.52553125,"fpyScore":null,"subRate":0.0525,"eeRate":42.0,"w2Pay":0.02625,"uhr":1600.0,"loadForecast":59.548125,"status":"Complete"},{"id":"fFNuYUP","name":"HOA / Katapult","rdbtask":"Permitting/Katapult Calibrate or Heights","revPct":0.2,"templateEeRate":47.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.042,"eeRate":47.0,"w2Pay":0.021,"uhr":2238.095238095238,"loadForecast":null,"status":"Not Started"},{"id":"nmbpD0e","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.3,"templateEeRate":41.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.063,"eeRate":41.0,"w2Pay":0.0315,"uhr":1301.5873015873017,"loadForecast":null,"status":"Not Started"},{"id":"zNmREpO","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":46.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":46.0,"w2Pay":0.0105,"uhr":4380.952380952381,"loadForecast":null,"status":"Not Started"},{"id":"aUVgAk7","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":46.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":46.0,"w2Pay":0.0105,"uhr":4380.952380952381,"loadForecast":null,"status":"Not Started"},{"id":"Gdp0CXP","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":64.0,"w2Pay":0.00525,"uhr":12190.476190476189,"loadForecast":null,"status":"Not Started"}]},{"id":"U07zUHL","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MO","milestone":"Permitting - Simple UG/Buried","project":"MOYAVV33","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","uForecast":9755.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"ZH3UDqp","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.65,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":21.592824324324322,"fpyScore":null,"subRate":0.1365,"eeRate":37.0,"w2Pay":0.06825,"uhr":542.1245421245421,"loadForecast":17.99402027027027,"status":"Complete"},{"id":"NVGMrer","name":"QC","rdbtask":"Permitting/Permit QC","revPct":0.05,"templateEeRate":48.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":48.0,"w2Pay":0.00525,"uhr":9142.857142857143,"loadForecast":null,"status":"Not Started"},{"id":"qtHioRR","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":42.0,"w2Pay":0.0105,"uhr":3999.9999999999995,"loadForecast":null,"status":"Not Started"},{"id":"dzHzmA4","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.15,"templateEeRate":47.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0315,"eeRate":47.0,"w2Pay":0.01575,"uhr":2984.126984126984,"loadForecast":null,"status":"Not Started"},{"id":"KR1Vxav","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":47.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":47.0,"w2Pay":0.00525,"uhr":8952.380952380952,"loadForecast":null,"status":"Not Started"}]},{"id":"InRVkLU","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MI","milestone":"Design Verification - UG/Buried","project":"MIYDXN14","masterRate":0.28,"milestonePct":1.0,"milestoneRate":0.28,"uom":"Foot","uForecast":17588.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"nnBbuQz","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-18","rdbHours":3.662701,"fpyScore":null,"subRate":0.019600000000000003,"eeRate":40.0,"w2Pay":0.009800000000000001,"uhr":4081.632653061224,"loadForecast":4.309060000000001,"status":"Complete"},{"id":"kChMbyI","name":"Permit Requirement Research","rdbtask":"Permitting/Permit Research","revPct":0.2,"templateEeRate":49.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.039200000000000006,"eeRate":49.0,"w2Pay":0.019600000000000003,"uhr":2499.9999999999995,"loadForecast":null,"status":"Not Started"},{"id":"bNiCdxn","name":"Fielding","rdbtask":"Fielding/Aerial Field Notes","revPct":0.4,"templateEeRate":43.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.07840000000000001,"eeRate":43.0,"w2Pay":0.039200000000000006,"uhr":1096.9387755102039,"loadForecast":null,"status":"Not Started"},{"id":"uVxUZpf","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":48.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.019600000000000003,"eeRate":48.0,"w2Pay":0.009800000000000001,"uhr":4897.959183673469,"loadForecast":null,"status":"Not Started"},{"id":"bH9vOWO","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":48.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0294,"eeRate":48.0,"w2Pay":0.0147,"uhr":3265.3061224489797,"loadForecast":null,"status":"Not Started"},{"id":"U6mbjhP","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.009800000000000001,"eeRate":64.0,"w2Pay":0.004900000000000001,"uhr":13061.224489795917,"loadForecast":null,"status":"Not Started"}]},{"id":"0Zf2pCL","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MI","milestone":"Design Verification - Aerial","project":"MIYDXN14","masterRate":0.28,"milestonePct":1.0,"milestoneRate":0.28,"uom":"Foot","uForecast":184755.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"hY7gbtP","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-20","rdbHours":40.73847750000001,"fpyScore":null,"subRate":0.019600000000000003,"eeRate":40.0,"w2Pay":0.009800000000000001,"uhr":4081.632653061224,"loadForecast":45.26497500000001,"status":"Complete"},{"id":"7ySeQMg","name":"Permit Requirement Research","rdbtask":"Permitting/JU Research","revPct":0.2,"templateEeRate":50.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.039200000000000006,"eeRate":50.0,"w2Pay":0.019600000000000003,"uhr":2551.020408163265,"loadForecast":null,"status":"Not Started"},{"id":"V0Lh8Wv","name":"Fielding","rdbtask":"Fielding/Buried/UG Field notes","revPct":0.4,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.07840000000000001,"eeRate":44.0,"w2Pay":0.039200000000000006,"uhr":1122.4489795918366,"loadForecast":null,"status":"Not Started"},{"id":"AwFv0Yg","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":49.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.019600000000000003,"eeRate":49.0,"w2Pay":0.009800000000000001,"uhr":4999.999999999999,"loadForecast":null,"status":"Not Started"},{"id":"7NZRBT7","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":49.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0294,"eeRate":49.0,"w2Pay":0.0147,"uhr":3333.3333333333335,"loadForecast":null,"status":"Not Started"},{"id":"qYHDBTq","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.009800000000000001,"eeRate":64.0,"w2Pay":0.004900000000000001,"uhr":13061.224489795917,"loadForecast":null,"status":"Not Started"}]},{"id":"8Grgmol","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MI","milestone":"Permitting - Simple Aerial","project":"MIYDXN14","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","uForecast":184755.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"xb0lnXv","name":"JU Application","rdbtask":"Permitting/JU Application","revPct":0.25,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":159.35118749999998,"fpyScore":null,"subRate":0.063,"eeRate":42.0,"w2Pay":0.0315,"uhr":1333.3333333333333,"loadForecast":138.56625,"status":"Complete"},{"id":"2Rra6fS","name":"HOA / Katapult","rdbtask":"Permitting/Katapult Calibrate or Heights","revPct":0.2,"templateEeRate":51.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0504,"eeRate":51.0,"w2Pay":0.0252,"uhr":2023.8095238095239,"loadForecast":null,"status":"Not Started"},{"id":"EVQOEXf","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.3,"templateEeRate":45.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0756,"eeRate":45.0,"w2Pay":0.0378,"uhr":1190.4761904761904,"loadForecast":null,"status":"Not Started"},{"id":"nQsKDGA","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":50.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0252,"eeRate":50.0,"w2Pay":0.0126,"uhr":3968.253968253968,"loadForecast":null,"status":"Not Started"},{"id":"UuRqphl","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":50.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0252,"eeRate":50.0,"w2Pay":0.0126,"uhr":3968.253968253968,"loadForecast":null,"status":"Not Started"},{"id":"hHVlnES","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0126,"eeRate":64.0,"w2Pay":0.0063,"uhr":10158.730158730159,"loadForecast":null,"status":"Not Started"}]},{"id":"9sMLT6m","customer":"Brightspeed","program":"Brightspeed FTTH ENG-MI","milestone":"Permitting - Simple UG/Buried","project":"MIYDXN14","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","uForecast":17588.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"aHr8IRh","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.65,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-19","rdbHours":40.09921394594595,"fpyScore":null,"subRate":0.1638,"eeRate":37.0,"w2Pay":0.0819,"uhr":451.77045177045176,"loadForecast":38.93127567567568,"status":"Complete"},{"id":"1E2JDBl","name":"QC","rdbtask":"Permitting/Permit QC","revPct":0.05,"templateEeRate":52.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0126,"eeRate":52.0,"w2Pay":0.0063,"uhr":8253.968253968254,"loadForecast":null,"status":"Not Started"},{"id":"d6DYyeN","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":46.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0252,"eeRate":46.0,"w2Pay":0.0126,"uhr":3650.7936507936506,"loadForecast":null,"status":"Not Started"},{"id":"djIs9hV","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.15,"templateEeRate":51.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0378,"eeRate":51.0,"w2Pay":0.0189,"uhr":2698.4126984126983,"loadForecast":null,"status":"Not Started"},{"id":"LXnGBB1","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":51.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0126,"eeRate":51.0,"w2Pay":0.0063,"uhr":8095.238095238095,"loadForecast":null,"status":"Not Started"}]},{"id":"7ZJ69Pq","customer":"Brightspeed","program":"Brightspeed FTTH ENG-TX","milestone":"Design Verification - UG/Buried","project":"TXPDAR12","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","uForecast":20202.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"nOjkeaB","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":4.7727225,"fpyScore":null,"subRate":0.021,"eeRate":40.0,"w2Pay":0.0105,"uhr":3809.523809523809,"loadForecast":5.303025000000001,"status":"Complete"},{"id":"KsoRRCQ","name":"Permit Requirement Research","rdbtask":"Permitting/Permit Research","revPct":0.2,"templateEeRate":53.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.042,"eeRate":53.0,"w2Pay":0.021,"uhr":2523.809523809524,"loadForecast":null,"status":"Not Started"},{"id":"5WMO5AH","name":"Fielding","rdbtask":"Fielding/Aerial Field Notes","revPct":0.4,"templateEeRate":47.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.084,"eeRate":47.0,"w2Pay":0.042,"uhr":1119.047619047619,"loadForecast":null,"status":"Not Started"},{"id":"O4ZektU","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":52.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":52.0,"w2Pay":0.0105,"uhr":4952.380952380952,"loadForecast":null,"status":"Not Started"},{"id":"JrhQR6F","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":52.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0315,"eeRate":52.0,"w2Pay":0.01575,"uhr":3301.5873015873017,"loadForecast":null,"status":"Not Started"},{"id":"EecAtpf","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":64.0,"w2Pay":0.00525,"uhr":12190.476190476189,"loadForecast":null,"status":"Not Started"}]},{"id":"LojIIf9","customer":"Brightspeed","program":"Brightspeed FTTH ENG-TX","milestone":"Design Verification - Aerial","project":"TXPDAR12","masterRate":0.3,"milestonePct":1.0,"milestoneRate":0.3,"uom":"Foot","uForecast":137555.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"cUDO4lK","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":34.302778125,"fpyScore":null,"subRate":0.021,"eeRate":40.0,"w2Pay":0.0105,"uhr":3809.523809523809,"loadForecast":36.10818750000001,"status":"Complete"},{"id":"NEfvuP1","name":"Permit Requirement Research","rdbtask":"Permitting/JU Research","revPct":0.2,"templateEeRate":54.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.042,"eeRate":54.0,"w2Pay":0.021,"uhr":2571.428571428571,"loadForecast":null,"status":"Not Started"},{"id":"uRr6YIC","name":"Fielding","rdbtask":"Fielding/Buried/UG Field notes","revPct":0.4,"templateEeRate":48.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.084,"eeRate":48.0,"w2Pay":0.042,"uhr":1142.857142857143,"loadForecast":null,"status":"Not Started"},{"id":"tu8zF9O","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":53.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.021,"eeRate":53.0,"w2Pay":0.0105,"uhr":5047.619047619048,"loadForecast":null,"status":"Not Started"},{"id":"HzlwUMV","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":53.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0315,"eeRate":53.0,"w2Pay":0.01575,"uhr":3365.079365079365,"loadForecast":null,"status":"Not Started"},{"id":"mI5BRh8","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0105,"eeRate":64.0,"w2Pay":0.00525,"uhr":12190.476190476189,"loadForecast":null,"status":"Not Started"}]},{"id":"RYxPY8E","customer":"Brightspeed","program":"Brightspeed FTTH ENG-TX","milestone":"Permitting - Simple Aerial","project":"TXPDAR12","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","uForecast":137555.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"4ChZESF","name":"JU Application","rdbtask":"Permitting/JU Application","revPct":0.25,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-18","rdbHours":108.32456250000001,"fpyScore":null,"subRate":0.063,"eeRate":42.0,"w2Pay":0.0315,"uhr":1333.3333333333333,"loadForecast":103.16625,"status":"Complete"},{"id":"qZ8pIx5","name":"HOA / Katapult","rdbtask":"Permitting/Katapult Calibrate or Heights","revPct":0.2,"templateEeRate":55.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0504,"eeRate":55.0,"w2Pay":0.0252,"uhr":2182.5396825396824,"loadForecast":null,"status":"Not Started"},{"id":"F21rWz5","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.3,"templateEeRate":49.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0756,"eeRate":49.0,"w2Pay":0.0378,"uhr":1296.2962962962963,"loadForecast":null,"status":"Not Started"},{"id":"FYrsK9E","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":54.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0252,"eeRate":54.0,"w2Pay":0.0126,"uhr":4285.714285714285,"loadForecast":null,"status":"Not Started"},{"id":"jHvIHCt","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":54.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0252,"eeRate":54.0,"w2Pay":0.0126,"uhr":4285.714285714285,"loadForecast":null,"status":"Not Started"},{"id":"lRJoWcU","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0126,"eeRate":64.0,"w2Pay":0.0063,"uhr":10158.730158730159,"loadForecast":null,"status":"Not Started"}]},{"id":"BR4cXsx","customer":"Brightspeed","program":"Brightspeed FTTH ENG-TX","milestone":"Permitting - Simple UG/Buried","project":"TXPDAR12","masterRate":0.36,"milestonePct":1.0,"milestoneRate":0.36,"uom":"Foot","uForecast":20202.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"cFK12BG","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.65,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-20","rdbHours":53.66088,"fpyScore":null,"subRate":0.1638,"eeRate":37.0,"w2Pay":0.0819,"uhr":451.77045177045176,"loadForecast":44.7174,"status":"Complete"},{"id":"CSzOjD8","name":"QC","rdbtask":"Permitting/Permit QC","revPct":0.05,"templateEeRate":56.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0126,"eeRate":56.0,"w2Pay":0.0063,"uhr":8888.888888888889,"loadForecast":null,"status":"Not Started"},{"id":"uQO001x","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":50.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0252,"eeRate":50.0,"w2Pay":0.0126,"uhr":3968.253968253968,"loadForecast":null,"status":"Not Started"},{"id":"tSV2ceN","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.15,"templateEeRate":55.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0378,"eeRate":55.0,"w2Pay":0.0189,"uhr":2910.05291005291,"loadForecast":null,"status":"Not Started"},{"id":"59UAgN2","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":55.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0126,"eeRate":55.0,"w2Pay":0.0063,"uhr":8730.15873015873,"loadForecast":null,"status":"Not Started"}]},{"id":"E4rXLvN","customer":"Brightspeed","program":"Brightspeed FTTH ENG-NC","milestone":"Design Verification - UG/Buried","project":"NCGMTR22","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","uForecast":12577.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"jGJXke1","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-15","rdbHours":2.432077375,"fpyScore":null,"subRate":0.0182,"eeRate":40.0,"w2Pay":0.0091,"uhr":4395.604395604395,"loadForecast":2.8612675000000003,"status":"Complete"},{"id":"Mo4iCpp","name":"Permit Requirement Research","rdbtask":"Permitting/Permit Research","revPct":0.2,"templateEeRate":57.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0364,"eeRate":57.0,"w2Pay":0.0182,"uhr":3131.8681318681315,"loadForecast":null,"status":"Not Started"},{"id":"aX3QjBv","name":"Fielding","rdbtask":"Fielding/Aerial Field Notes","revPct":0.4,"templateEeRate":51.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0728,"eeRate":51.0,"w2Pay":0.0364,"uhr":1401.098901098901,"loadForecast":null,"status":"Not Started"},{"id":"KNAp0mx","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":56.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0182,"eeRate":56.0,"w2Pay":0.0091,"uhr":6153.846153846153,"loadForecast":null,"status":"Not Started"},{"id":"DoJJ9s8","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":56.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.027299999999999998,"eeRate":56.0,"w2Pay":0.013649999999999999,"uhr":4102.5641025641025,"loadForecast":null,"status":"Not Started"},{"id":"OrJQUdL","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0091,"eeRate":64.0,"w2Pay":0.00455,"uhr":14065.934065934065,"loadForecast":null,"status":"Not Started"}]},{"id":"PPKY6go","customer":"Brightspeed","program":"Brightspeed FTTH ENG-NC","milestone":"Design Verification - Aerial","project":"NCGMTR22","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","uForecast":108555.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"MQSOZM4","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-19","rdbHours":22.226636250000002,"fpyScore":null,"subRate":0.0182,"eeRate":40.0,"w2Pay":0.0091,"uhr":4395.604395604395,"loadForecast":24.696262500000003,"status":"Complete"},{"id":"OtBJTfs","name":"Permit Requirement Research","rdbtask":"Permitting/JU Research","revPct":0.2,"templateEeRate":58.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0364,"eeRate":58.0,"w2Pay":0.0182,"uhr":3186.813186813187,"loadForecast":null,"status":"Not Started"},{"id":"UkiH8G4","name":"Fielding","rdbtask":"Fielding/Buried/UG Field notes","revPct":0.4,"templateEeRate":52.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0728,"eeRate":52.0,"w2Pay":0.0364,"uhr":1428.5714285714284,"loadForecast":null,"status":"Not Started"},{"id":"ZpZDYUv","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":57.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0182,"eeRate":57.0,"w2Pay":0.0091,"uhr":6263.736263736263,"loadForecast":null,"status":"Not Started"},{"id":"h7i71S8","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":57.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.027299999999999998,"eeRate":57.0,"w2Pay":0.013649999999999999,"uhr":4175.824175824177,"loadForecast":null,"status":"Not Started"},{"id":"7XwXaHC","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0091,"eeRate":64.0,"w2Pay":0.00455,"uhr":14065.934065934065,"loadForecast":null,"status":"Not Started"}]},{"id":"0CPNLbW","customer":"Brightspeed","program":"Brightspeed FTTH ENG-NC","milestone":"Permitting - Simple Aerial","project":"NCGMTR22","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","uForecast":108555.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"b2I4ndZ","name":"JU Application","rdbtask":"Permitting/JU Application","revPct":0.25,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-15","rdbHours":83.22549999999998,"fpyScore":null,"subRate":0.055999999999999994,"eeRate":42.0,"w2Pay":0.027999999999999997,"uhr":1500.0000000000002,"loadForecast":72.36999999999999,"status":"Complete"},{"id":"4szi6sE","name":"HOA / Katapult","rdbtask":"Permitting/Katapult Calibrate or Heights","revPct":0.2,"templateEeRate":59.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0448,"eeRate":59.0,"w2Pay":0.0224,"uhr":2633.9285714285716,"loadForecast":null,"status":"Not Started"},{"id":"g3iCPU6","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.3,"templateEeRate":53.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0672,"eeRate":53.0,"w2Pay":0.0336,"uhr":1577.3809523809525,"loadForecast":null,"status":"Not Started"},{"id":"zUjzgEz","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":58.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0224,"eeRate":58.0,"w2Pay":0.0112,"uhr":5178.571428571428,"loadForecast":null,"status":"Not Started"},{"id":"6cwB61g","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":58.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0224,"eeRate":58.0,"w2Pay":0.0112,"uhr":5178.571428571428,"loadForecast":null,"status":"Not Started"},{"id":"QH8wylh","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0112,"eeRate":64.0,"w2Pay":0.0056,"uhr":11428.57142857143,"loadForecast":null,"status":"Not Started"}]},{"id":"W1GC7dD","customer":"Brightspeed","program":"Brightspeed FTTH ENG-NC","milestone":"Permitting - Simple UG/Buried","project":"NCGMTR22","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","uForecast":12557.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"phJeVmn","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.65,"templateEeRate":37.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":25.447948324324322,"fpyScore":null,"subRate":0.14559999999999998,"eeRate":37.0,"w2Pay":0.07279999999999999,"uhr":508.2417582417583,"loadForecast":24.706745945945944,"status":"Complete"},{"id":"1uj3a1i","name":"QC","rdbtask":"Permitting/Permit QC","revPct":0.05,"templateEeRate":60.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0112,"eeRate":60.0,"w2Pay":0.0056,"uhr":10714.285714285714,"loadForecast":null,"status":"Not Started"},{"id":"ipkObaW","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":54.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0224,"eeRate":54.0,"w2Pay":0.0112,"uhr":4821.428571428572,"loadForecast":null,"status":"Not Started"},{"id":"oukdTGU","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.15,"templateEeRate":59.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0336,"eeRate":59.0,"w2Pay":0.0168,"uhr":3511.904761904762,"loadForecast":null,"status":"Not Started"},{"id":"DWFgF6c","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":59.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0112,"eeRate":59.0,"w2Pay":0.0056,"uhr":10535.714285714286,"loadForecast":null,"status":"Not Started"}]},{"id":"IuhvPU1","customer":"Brightspeed","program":"Brightspeed FTTH ENG-SC","milestone":"Design Verification - UG/Buried","project":"SCTTMA37","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","uForecast":20155.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"yQE4efL","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-18","rdbHours":4.12673625,"fpyScore":null,"subRate":0.0182,"eeRate":40.0,"w2Pay":0.0091,"uhr":4395.604395604395,"loadForecast":4.585262500000001,"status":"Complete"},{"id":"erNHu9G","name":"Permit Requirement Research","rdbtask":"Permitting/Permit Application","revPct":0.2,"templateEeRate":61.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0364,"eeRate":61.0,"w2Pay":0.0182,"uhr":3351.6483516483513,"loadForecast":null,"status":"Not Started"},{"id":"CLgR0OV","name":"Fielding","rdbtask":"Fielding/Aerial Field Notes","revPct":0.4,"templateEeRate":55.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0728,"eeRate":55.0,"w2Pay":0.0364,"uhr":1510.989010989011,"loadForecast":null,"status":"Not Started"},{"id":"SnBovCz","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":60.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0182,"eeRate":60.0,"w2Pay":0.0091,"uhr":6593.406593406593,"loadForecast":null,"status":"Not Started"},{"id":"fAPxj5e","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":60.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.027299999999999998,"eeRate":60.0,"w2Pay":0.013649999999999999,"uhr":4395.604395604396,"loadForecast":null,"status":"Not Started"},{"id":"ZffTYIK","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0091,"eeRate":64.0,"w2Pay":0.00455,"uhr":14065.934065934065,"loadForecast":null,"status":"Not Started"}]},{"id":"fdjMPqP","customer":"Brightspeed","program":"Brightspeed FTTH ENG-SC","milestone":"Design Verification - Aerial","project":"SCTTMA37","masterRate":0.26,"milestonePct":1.0,"milestoneRate":0.26,"uom":"Foot","uForecast":103557.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"S8LvJnO","name":"Arc GIS creation","rdbtask":"Prelim/Prelims for Field","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-20","rdbHours":22.381256625000002,"fpyScore":null,"subRate":0.0182,"eeRate":40.0,"w2Pay":0.0091,"uhr":4395.604395604395,"loadForecast":23.559217500000003,"status":"Complete"},{"id":"ng0wVJY","name":"Permit Requirement Research","rdbtask":"Permitting/JU Research","revPct":0.2,"templateEeRate":62.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0364,"eeRate":62.0,"w2Pay":0.0182,"uhr":3406.5934065934066,"loadForecast":null,"status":"Not Started"},{"id":"08YMNb5","name":"Fielding","rdbtask":"Fielding/Buried/UG Field notes","revPct":0.4,"templateEeRate":56.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0728,"eeRate":56.0,"w2Pay":0.0364,"uhr":1538.4615384615383,"loadForecast":null,"status":"Not Started"},{"id":"ZqlRtva","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":61.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0182,"eeRate":61.0,"w2Pay":0.0091,"uhr":6703.296703296703,"loadForecast":null,"status":"Not Started"},{"id":"1JyiNbU","name":"Shape File Cleanup","rdbtask":"Design/Construction Prints for Fiber","revPct":0.15,"templateEeRate":61.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.027299999999999998,"eeRate":61.0,"w2Pay":0.013649999999999999,"uhr":4468.864468864469,"loadForecast":null,"status":"Not Started"},{"id":"nAvwSWJ","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0091,"eeRate":64.0,"w2Pay":0.00455,"uhr":14065.934065934065,"loadForecast":null,"status":"Not Started"}]},{"id":"Z5f0pKG","customer":"Brightspeed","program":"Brightspeed FTTH ENG-SC","milestone":"Permitting - Simple Aerial","project":"SCTTMA37","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","uForecast":103557.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"EBqUhAr","name":"JU Application","rdbtask":"Permitting/JU Application","revPct":0.25,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-15","rdbHours":72.48989999999999,"fpyScore":null,"subRate":0.055999999999999994,"eeRate":42.0,"w2Pay":0.027999999999999997,"uhr":1500.0000000000002,"loadForecast":69.03799999999998,"status":"Complete"},{"id":"QEPcyLa","name":"HOA / Katapult","rdbtask":"Permitting/Katapult Calibrate or Heights","revPct":0.2,"templateEeRate":63.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0448,"eeRate":63.0,"w2Pay":0.0224,"uhr":2812.5,"loadForecast":null,"status":"Not Started"},{"id":"snipuaU","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.3,"templateEeRate":57.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0672,"eeRate":57.0,"w2Pay":0.0336,"uhr":1696.4285714285716,"loadForecast":null,"status":"Not Started"},{"id":"kxRFZXe","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":62.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0224,"eeRate":62.0,"w2Pay":0.0112,"uhr":5535.714285714285,"loadForecast":null,"status":"Not Started"},{"id":"1cb51JJ","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":62.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0224,"eeRate":62.0,"w2Pay":0.0112,"uhr":5535.714285714285,"loadForecast":null,"status":"Not Started"},{"id":"RzhbuXM","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0112,"eeRate":64.0,"w2Pay":0.0056,"uhr":11428.57142857143,"loadForecast":null,"status":"Not Started"}]},{"id":"rdFtCdZ","customer":"Brightspeed","program":"Brightspeed FTTH ENG-SC","milestone":"Permitting - Simple UG/Buried","project":"SCTTMA37","masterRate":0.32,"milestonePct":1.0,"milestoneRate":0.32,"uom":"Foot","uForecast":20155.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"ytvukFh","name":"Permit Prints","rdbtask":"Permitting/Permit Prints","revPct":0.65,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-19","rdbHours":44.018519999999995,"fpyScore":null,"subRate":0.14559999999999998,"eeRate":40.0,"w2Pay":0.07279999999999999,"uhr":549.4505494505495,"loadForecast":36.6821,"status":"Complete"},{"id":"F4vTYYo","name":"QC","rdbtask":"Permitting/Permit QC","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0112,"eeRate":64.0,"w2Pay":0.0056,"uhr":11428.57142857143,"loadForecast":null,"status":"Not Started"},{"id":"jmLVOkV","name":"Application Submission","rdbtask":"Permitting/Permit Application","revPct":0.1,"templateEeRate":58.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0224,"eeRate":58.0,"w2Pay":0.0112,"uhr":5178.571428571428,"loadForecast":null,"status":"Not Started"},{"id":"EUVB5IN","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.15,"templateEeRate":63.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0336,"eeRate":63.0,"w2Pay":0.0168,"uhr":3750.0000000000005,"loadForecast":null,"status":"Not Started"},{"id":"M1MjeBs","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":63.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0112,"eeRate":63.0,"w2Pay":0.0056,"uhr":11250.0,"loadForecast":null,"status":"Not Started"}]},{"id":"fQrSO42","customer":"BluePeak Engineering","program":"Bluepeak ENG - OK","milestone":"Fielding / Optimized HLD","project":"DA0012","masterRate":85.0,"milestonePct":0.3,"milestoneRate":25.5,"uom":"Passing","uForecast":327.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"e11MFCI","name":"Fielding","rdbtask":"Fielding Walkout","revPct":0.4,"templateEeRate":45.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":22.050699999999996,"fpyScore":null,"subRate":7.14,"eeRate":45.0,"w2Pay":3.57,"uhr":12.605042016806724,"loadForecast":25.941999999999997,"status":"Complete"},{"id":"X3BYOtD","name":"Optimized HLD","rdbtask":"Fielding/Field QC","revPct":0.3,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":5.3549999999999995,"eeRate":40.0,"w2Pay":2.6774999999999998,"uhr":14.939309056956118,"loadForecast":null,"status":"Not Started"},{"id":"jdg3vSF","name":"Landbase","rdbtask":"Design/Base Map & Utilities","revPct":0.15,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.6774999999999998,"eeRate":40.0,"w2Pay":1.3387499999999999,"uhr":29.878618113912236,"loadForecast":null,"status":"Not Started"},{"id":"kpBBGjx","name":"QC & Submission","rdbtask":"Design/Milestone Deliverable","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.785,"eeRate":44.0,"w2Pay":0.8925,"uhr":49.299719887955185,"loadForecast":null,"status":"Not Started"},{"id":"rzuLWOe","name":"PM Closeout","rdbtask":"Project Management/Project Management/Meetings","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.8925,"eeRate":64.0,"w2Pay":0.44625,"uhr":143.4173669467787,"loadForecast":null,"status":"Not Started"}]},{"id":"rUBHtYD","customer":"BluePeak Engineering","program":"Bluepeak ENG - OK","milestone":"Permitting","project":"DA0012","masterRate":85.0,"milestonePct":0.4,"milestoneRate":34.0,"uom":"Passing","uForecast":327.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"uKiv7Ry","name":"Aerial/Undergound Civil Created","rdbtask":"Design/Civil Design","revPct":0.55,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-15","rdbHours":48.1548375,"fpyScore":null,"subRate":13.09,"eeRate":40.0,"w2Pay":6.545,"uhr":6.111535523300229,"loadForecast":53.505375,"status":"Complete"},{"id":"K6txXYP","name":"QC","rdbtask":"Design/Design QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.38,"eeRate":44.0,"w2Pay":1.19,"uhr":36.97478991596639,"loadForecast":null,"status":"Not Started"},{"id":"ZTQGOAw","name":"Aerial/JU Permit Creation","rdbtask":"Permitting/Permitting","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.38,"eeRate":40.0,"w2Pay":1.19,"uhr":33.61344537815126,"loadForecast":null,"status":"Not Started"},{"id":"wln6Eoi","name":"Aerial/JU Permit Submission","rdbtask":"Permitting/Permitting","revPct":0.05,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.19,"eeRate":40.0,"w2Pay":0.595,"uhr":67.22689075630252,"loadForecast":null,"status":"Not Started"},{"id":"e0gVZ2c","name":"Underground Permit Creation","rdbtask":"Permitting/Permitting","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.38,"eeRate":40.0,"w2Pay":1.19,"uhr":33.61344537815126,"loadForecast":null,"status":"Not Started"},{"id":"uVixkZV","name":"Underground Permit Submission","rdbtask":"Permitting/Permitting","revPct":0.05,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.19,"eeRate":40.0,"w2Pay":0.595,"uhr":67.22689075630252,"loadForecast":null,"status":"Not Started"},{"id":"YkBzPoB","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.19,"eeRate":64.0,"w2Pay":0.595,"uhr":107.56302521008404,"loadForecast":null,"status":"Not Started"}]},{"id":"q4jB6nB","customer":"BluePeak Engineering","program":"Bluepeak ENG - OK","milestone":"Fiber Design","project":"DA0012","masterRate":85.0,"milestonePct":0.2,"milestoneRate":17.0,"uom":"Passing","uForecast":327.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"Zw69Crx","name":"Create Fiber Design","rdbtask":"Design/Fiber Design","revPct":0.8,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-18","rdbHours":42.61899999999999,"fpyScore":null,"subRate":9.52,"eeRate":42.0,"w2Pay":4.76,"uhr":8.823529411764707,"loadForecast":37.059999999999995,"status":"Complete"},{"id":"G7YXipN","name":"QC","rdbtask":"Design/Design QC","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.7849999999999997,"eeRate":44.0,"w2Pay":0.8924999999999998,"uhr":49.29971988795519,"loadForecast":null,"status":"Not Started"},{"id":"2Ig00rV","name":"PM Closeout","rdbtask":"Project Management/Project Management/Meetings","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.595,"eeRate":64.0,"w2Pay":0.2975,"uhr":215.12605042016807,"loadForecast":null,"status":"Not Started"}]},{"id":"pZITGgr","customer":"BluePeak Engineering","program":"Bluepeak ENG - OK","milestone":"IFC / Vetro","project":"DA0012","masterRate":85.0,"milestonePct":0.1,"milestoneRate":8.5,"uom":"Passing","uForecast":327.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"vbdFo9x","name":"Vetro Posting","rdbtask":"Design/Vetro-Basemap","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-20","rdbHours":2.5050243749999996,"fpyScore":null,"subRate":0.595,"eeRate":40.0,"w2Pay":0.2975,"uhr":134.45378151260505,"loadForecast":2.4320625,"status":"Complete"},{"id":"b50OXir","name":"IFC Creation","rdbtask":"Client Operation Systems/Records Posting","revPct":0.8,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.76,"eeRate":42.0,"w2Pay":2.38,"uhr":17.647058823529413,"loadForecast":null,"status":"Not Started"},{"id":"ZRiRBae","name":"QC & IFC Submission","rdbtask":"Design/Milestone Deliverable","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.595,"eeRate":44.0,"w2Pay":0.2975,"uhr":147.89915966386556,"loadForecast":null,"status":"Not Started"}]},{"id":"TucHYkW","customer":"BluePeak Engineering","program":"Bluepeak ENG - TX","milestone":"Fielding / Optimized HLD","project":"DA0032","masterRate":84.0,"milestonePct":0.3,"milestoneRate":25.2,"uom":"Passing","uForecast":292.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"scAXCg4","name":"Fielding","rdbtask":"Fielding Walkout","revPct":0.4,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":23.178959999999996,"fpyScore":null,"subRate":7.055999999999999,"eeRate":40.0,"w2Pay":3.5279999999999996,"uhr":11.337868480725625,"loadForecast":25.754399999999997,"status":"Complete"},{"id":"KbFpiAM","name":"Optimized HLD","rdbtask":"Fielding/Field QC","revPct":0.3,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":5.291999999999999,"eeRate":40.0,"w2Pay":2.6459999999999995,"uhr":15.117157974300834,"loadForecast":null,"status":"Not Started"},{"id":"ozPf8eG","name":"Landbase","rdbtask":"Design/Base Map & Utilities","revPct":0.15,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.6459999999999995,"eeRate":40.0,"w2Pay":1.3229999999999997,"uhr":30.23431594860167,"loadForecast":null,"status":"Not Started"},{"id":"F9IyDN8","name":"QC & Submission","rdbtask":"Design/Milestone Deliverable","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.7639999999999998,"eeRate":44.0,"w2Pay":0.8819999999999999,"uhr":49.88662131519275,"loadForecast":null,"status":"Not Started"},{"id":"pbWvTMV","name":"PM Closeout","rdbtask":"Project Management/Project Management/Meetings","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.8819999999999999,"eeRate":64.0,"w2Pay":0.44099999999999995,"uhr":145.124716553288,"loadForecast":null,"status":"Not Started"}]},{"id":"v9r86eN","customer":"BluePeak Engineering","program":"Bluepeak ENG - TX","milestone":"Permitting","project":"DA0032","masterRate":84.0,"milestonePct":0.4,"milestoneRate":33.6,"uom":"Passing","uForecast":292.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"CRNYdWC","name":"Aerial/Undergound Civil Created","rdbtask":"Design/Civil Design","revPct":0.55,"templateEeRate":45.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-19","rdbHours":39.871626666666664,"fpyScore":null,"subRate":12.936,"eeRate":45.0,"w2Pay":6.468,"uhr":6.957328385899815,"loadForecast":41.97013333333333,"status":"Complete"},{"id":"scmc5F9","name":"QC","rdbtask":"Design/Design QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.352,"eeRate":44.0,"w2Pay":1.176,"uhr":37.41496598639456,"loadForecast":null,"status":"Not Started"},{"id":"HpUlwW1","name":"Aerial/JU Permit Creation","rdbtask":"Permitting/Permitting","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.352,"eeRate":40.0,"w2Pay":1.176,"uhr":34.013605442176875,"loadForecast":null,"status":"Not Started"},{"id":"uhw3U3x","name":"Aerial/JU Permit Submission","rdbtask":"Permitting/Permitting","revPct":0.05,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.176,"eeRate":40.0,"w2Pay":0.588,"uhr":68.02721088435375,"loadForecast":null,"status":"Not Started"},{"id":"8EE5GXT","name":"Underground Permit Creation","rdbtask":"Permitting/Permitting","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.352,"eeRate":40.0,"w2Pay":1.176,"uhr":34.013605442176875,"loadForecast":null,"status":"Not Started"},{"id":"eLYHteO","name":"Underground Permit Submission","rdbtask":"Permitting/Permitting","revPct":0.05,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.176,"eeRate":40.0,"w2Pay":0.588,"uhr":68.02721088435375,"loadForecast":null,"status":"Not Started"},{"id":"tLAQvc1","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.176,"eeRate":64.0,"w2Pay":0.588,"uhr":108.843537414966,"loadForecast":null,"status":"Not Started"}]},{"id":"OphTExI","customer":"BluePeak Engineering","program":"Bluepeak ENG - TX","milestone":"Fiber Design","project":"DA0032","masterRate":84.0,"milestonePct":0.2,"milestoneRate":16.8,"uom":"Passing","uForecast":292.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"wXQ7iLW","name":"Create Fiber Design","rdbtask":"Design/Fiber Design","revPct":0.8,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-15","rdbHours":34.339200000000005,"fpyScore":null,"subRate":9.408,"eeRate":42.0,"w2Pay":4.704,"uhr":8.928571428571429,"loadForecast":32.704,"status":"Complete"},{"id":"ceWwxJL","name":"QC","rdbtask":"Design/Design QC","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.764,"eeRate":44.0,"w2Pay":0.882,"uhr":49.88662131519274,"loadForecast":null,"status":"Not Started"},{"id":"Q6xVJGy","name":"PM Closeout","rdbtask":"Project Management/Project Management/Meetings","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.588,"eeRate":64.0,"w2Pay":0.294,"uhr":217.687074829932,"loadForecast":null,"status":"Not Started"}]},{"id":"S5NXFhm","customer":"BluePeak Engineering","program":"Bluepeak ENG - TX","milestone":"IFC / Vetro","project":"DA0032","masterRate":84.0,"milestonePct":0.1,"milestoneRate":8.4,"uom":"Passing","uForecast":292.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"qqB9r4E","name":"Vetro Posting","rdbtask":"Design/Vetro-Basemap","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":2.57544,"fpyScore":null,"subRate":0.588,"eeRate":40.0,"w2Pay":0.294,"uhr":136.0544217687075,"loadForecast":2.1462,"status":"Complete"},{"id":"h0C3BfQ","name":"IFC Creation","rdbtask":"Client Operation Systems/Records Posting","revPct":0.8,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.704,"eeRate":42.0,"w2Pay":2.352,"uhr":17.857142857142858,"loadForecast":null,"status":"Not Started"},{"id":"0tveH30","name":"QC & IFC Submission","rdbtask":"Design/Milestone Deliverable","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.588,"eeRate":44.0,"w2Pay":0.294,"uhr":149.65986394557825,"loadForecast":null,"status":"Not Started"}]},{"id":"630pNIh","customer":"BluePeak Engineering","program":"Bluepeak ENG - WY","milestone":"Fielding / Optimized HLD","project":"DA0017","masterRate":89.0,"milestonePct":0.3,"milestoneRate":26.7,"uom":"Passing","uForecast":378.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"iXbIwXI","name":"Fielding","rdbtask":"Fielding Walkout","revPct":0.4,"templateEeRate":45.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-18","rdbHours":26.689319999999995,"fpyScore":null,"subRate":7.475999999999999,"eeRate":45.0,"w2Pay":3.7379999999999995,"uhr":12.038523274478331,"loadForecast":31.399199999999997,"status":"Complete"},{"id":"Lft9SGV","name":"Optimized HLD","rdbtask":"Fielding/Field QC","revPct":0.3,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":5.606999999999999,"eeRate":40.0,"w2Pay":2.8034999999999997,"uhr":14.267879436418765,"loadForecast":null,"status":"Not Started"},{"id":"Ze8NBQv","name":"Landbase","rdbtask":"Design/Base Map & Utilities","revPct":0.15,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.8034999999999997,"eeRate":40.0,"w2Pay":1.4017499999999998,"uhr":28.53575887283753,"loadForecast":null,"status":"Not Started"},{"id":"2WNl7A4","name":"QC & Submission","rdbtask":"Design/Milestone Deliverable","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.8689999999999998,"eeRate":44.0,"w2Pay":0.9344999999999999,"uhr":47.08400214018192,"loadForecast":null,"status":"Not Started"},{"id":"dhjkuRv","name":"PM Closeout","rdbtask":"Project Management/Project Management/Meetings","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.9344999999999999,"eeRate":64.0,"w2Pay":0.46724999999999994,"uhr":136.97164258962013,"loadForecast":null,"status":"Not Started"}]},{"id":"Mp1juJt","customer":"BluePeak Engineering","program":"Bluepeak ENG - WY","milestone":"Permitting","project":"DA0017","masterRate":89.0,"milestonePct":0.4,"milestoneRate":35.6,"uom":"Passing","uForecast":378.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"sHFk6jO","name":"Aerial/Undergound Civil Created","rdbtask":"Design/Civil Design","revPct":0.55,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-20","rdbHours":58.28476499999999,"fpyScore":null,"subRate":13.706,"eeRate":40.0,"w2Pay":6.853,"uhr":5.83685976944404,"loadForecast":64.76084999999999,"status":"Complete"},{"id":"SL0IZbc","name":"QC","rdbtask":"Design/Design QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.492,"eeRate":44.0,"w2Pay":1.246,"uhr":35.313001605136435,"loadForecast":null,"status":"Not Started"},{"id":"NJOVzNE","name":"Aerial/JU Permit Creation","rdbtask":"Permitting/Permitting","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.492,"eeRate":40.0,"w2Pay":1.246,"uhr":32.102728731942214,"loadForecast":null,"status":"Not Started"},{"id":"Mr7DXQs","name":"Aerial/JU Permit Submission","rdbtask":"Permitting/Permitting","revPct":0.05,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.246,"eeRate":40.0,"w2Pay":0.623,"uhr":64.20545746388443,"loadForecast":null,"status":"Not Started"},{"id":"edBEmLt","name":"Underground Permit Creation","rdbtask":"Permitting/Permitting","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.492,"eeRate":40.0,"w2Pay":1.246,"uhr":32.102728731942214,"loadForecast":null,"status":"Not Started"},{"id":"ST18iwI","name":"Underground Permit Submission","rdbtask":"Permitting/Permitting","revPct":0.05,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.246,"eeRate":40.0,"w2Pay":0.623,"uhr":64.20545746388443,"loadForecast":null,"status":"Not Started"},{"id":"tCqpgrx","name":"PM Closeout","rdbtask":"Project Management/PM - Meetings/Status","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.246,"eeRate":64.0,"w2Pay":0.623,"uhr":102.72873194221509,"loadForecast":null,"status":"Not Started"}]},{"id":"VwyJmIe","customer":"BluePeak Engineering","program":"Bluepeak ENG - WY","milestone":"Fiber Design","project":"DA0017","masterRate":89.0,"milestonePct":0.2,"milestoneRate":17.8,"uom":"Passing","uForecast":378.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"VEFEtb6","name":"Create Fiber Design","rdbtask":"Design/Fiber Design","revPct":0.8,"templateEeRate":42.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":51.58439999999999,"fpyScore":null,"subRate":9.968,"eeRate":42.0,"w2Pay":4.984,"uhr":8.426966292134832,"loadForecast":44.855999999999995,"status":"Complete"},{"id":"F7nvdE2","name":"QC","rdbtask":"Design/Design QC","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.8689999999999998,"eeRate":44.0,"w2Pay":0.9344999999999999,"uhr":47.08400214018192,"loadForecast":null,"status":"Not Started"},{"id":"ODH0A2T","name":"PM Closeout","rdbtask":"Project Management/Project Management/Meetings","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.623,"eeRate":64.0,"w2Pay":0.3115,"uhr":205.45746388443018,"loadForecast":null,"status":"Not Started"}]},{"id":"FuMk9Ts","customer":"BluePeak Engineering","program":"Bluepeak ENG - WY","milestone":"IFC / Vetro","project":"DA0017","masterRate":89.0,"milestonePct":0.1,"milestoneRate":8.9,"uom":"Passing","uForecast":378.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"FVr9Qh8","name":"Vetro Posting","rdbtask":"Design/Vetro-Basemap","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-19","rdbHours":3.0319852500000004,"fpyScore":null,"subRate":0.623,"eeRate":40.0,"w2Pay":0.3115,"uhr":128.41091492776886,"loadForecast":2.9436750000000003,"status":"Complete"},{"id":"yXv6UmF","name":"IFC Creation","rdbtask":"Client Operation Systems/Records Posting","revPct":0.8,"templateEeRate":42.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.984,"eeRate":42.0,"w2Pay":2.492,"uhr":16.853932584269664,"loadForecast":null,"status":"Not Started"},{"id":"FciuDCL","name":"QC & IFC Submission","rdbtask":"Design/Milestone Deliverable","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.623,"eeRate":44.0,"w2Pay":0.3115,"uhr":141.25200642054574,"loadForecast":null,"status":"Not Started"}]},{"id":"vVSNQLl","customer":"Frontier","program":"Frontier FTTH-13 North","milestone":"Design Created","project":"WIAA-012","masterRate":32.48,"milestonePct":1.0,"milestoneRate":32.48,"uom":"Passing","uForecast":337.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"uZHRsYw","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":46.5,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-15","rdbHours":22.244609032258065,"fpyScore":null,"subRate":6.820799999999999,"eeRate":46.5,"w2Pay":3.4103999999999997,"uhr":13.634764250527798,"loadForecast":24.716232258064515,"status":"Complete"},{"id":"P8KXSQb","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"D7WWJSK","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":208.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.547199999999999,"eeRate":208.0,"w2Pay":2.2735999999999996,"uhr":91.48486980999297,"loadForecast":null,"status":"Not Started"},{"id":"kMM0jQb","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"6gbtjQz","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":5.683999999999999,"eeRate":40.0,"w2Pay":2.8419999999999996,"uhr":14.074595355383535,"loadForecast":null,"status":"Not Started"},{"id":"W52Tdim","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"uPGtk4v","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.2735999999999996,"eeRate":40.0,"w2Pay":1.1367999999999998,"uhr":35.18648838845884,"loadForecast":null,"status":"Not Started"}]},{"id":"Dm7tO4f","customer":"Frontier","program":"Frontier FTTH-13 North","milestone":"Design Created","project":"WIAA-013","masterRate":32.48,"milestonePct":1.0,"milestoneRate":32.48,"uom":"Passing","uForecast":391.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"pIn8srm","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":46.5,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-15","rdbHours":27.24286193548387,"fpyScore":null,"subRate":6.820799999999999,"eeRate":46.5,"w2Pay":3.4103999999999997,"uhr":13.634764250527798,"loadForecast":28.676696774193548,"status":"Complete"},{"id":"Rtv5Xqh","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"Px8Y7Xs","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":208.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.547199999999999,"eeRate":208.0,"w2Pay":2.2735999999999996,"uhr":91.48486980999297,"loadForecast":null,"status":"Not Started"},{"id":"rSvBpDm","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"H5RiMKp","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":5.683999999999999,"eeRate":40.0,"w2Pay":2.8419999999999996,"uhr":14.074595355383535,"loadForecast":null,"status":"Not Started"},{"id":"PGNdzSg","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"VaI5z52","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.2735999999999996,"eeRate":40.0,"w2Pay":1.1367999999999998,"uhr":35.18648838845884,"loadForecast":null,"status":"Not Started"}]},{"id":"oU7sSaO","customer":"Frontier","program":"Frontier FTTH-13 North","milestone":"Design Created","project":"WIAA-014","masterRate":32.48,"milestonePct":1.0,"milestoneRate":32.48,"uom":"Passing","uForecast":308.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"JHS64k2","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":46.5,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-18","rdbHours":23.718781935483868,"fpyScore":null,"subRate":6.820799999999999,"eeRate":46.5,"w2Pay":3.4103999999999997,"uhr":13.634764250527798,"loadForecast":22.589316129032255,"status":"Complete"},{"id":"k59yE67","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"52aJg8r","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":208.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.547199999999999,"eeRate":208.0,"w2Pay":2.2735999999999996,"uhr":91.48486980999297,"loadForecast":null,"status":"Not Started"},{"id":"9HE60Dl","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"gkCplTX","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":5.683999999999999,"eeRate":40.0,"w2Pay":2.8419999999999996,"uhr":14.074595355383535,"loadForecast":null,"status":"Not Started"},{"id":"JUk13ZF","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.1367999999999998,"eeRate":44.0,"w2Pay":0.5683999999999999,"uhr":77.41027445460945,"loadForecast":null,"status":"Not Started"},{"id":"fPliupq","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.2735999999999996,"eeRate":40.0,"w2Pay":1.1367999999999998,"uhr":35.18648838845884,"loadForecast":null,"status":"Not Started"}]},{"id":"CYSyYUJ","customer":"Frontier","program":"Frontier FTTH-13 South","milestone":"Design Created","project":"TXBN-011","masterRate":34.48,"milestonePct":1.0,"milestoneRate":34.48,"uom":"Passing","uForecast":229.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"QdhtzF3","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":47.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-20","rdbHours":21.167785531914888,"fpyScore":null,"subRate":7.240799999999998,"eeRate":47.0,"w2Pay":3.620399999999999,"uhr":12.981990940227602,"loadForecast":17.63982127659574,"status":"Complete"},{"id":"Rth4sMn","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"ijULzID","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":232.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.8271999999999995,"eeRate":232.0,"w2Pay":2.4135999999999997,"uhr":96.12197547232351,"loadForecast":null,"status":"Not Started"},{"id":"HPnpU2f","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"BReIdHF","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":6.033999999999999,"eeRate":40.0,"w2Pay":3.0169999999999995,"uhr":13.258203513423933,"loadForecast":null,"status":"Not Started"},{"id":"JjuGhmK","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"fFYCFCd","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.4135999999999997,"eeRate":40.0,"w2Pay":1.2067999999999999,"uhr":33.14550878355983,"loadForecast":null,"status":"Not Started"}]},{"id":"cLRdTyo","customer":"Frontier","program":"Frontier FTTH-13 South","milestone":"Design Created","project":"TXBN-012","masterRate":34.48,"milestonePct":1.0,"milestoneRate":34.48,"uom":"Passing","uForecast":178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"cvd95e5","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":47.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":11.654606808510636,"fpyScore":null,"subRate":7.240799999999998,"eeRate":47.0,"w2Pay":3.620399999999999,"uhr":12.981990940227602,"loadForecast":13.711302127659572,"status":"Complete"},{"id":"bzVV8OA","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"9x14xQP","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":232.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.8271999999999995,"eeRate":232.0,"w2Pay":2.4135999999999997,"uhr":96.12197547232351,"loadForecast":null,"status":"Not Started"},{"id":"HOvlHGT","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"nabsPHG","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":6.033999999999999,"eeRate":40.0,"w2Pay":3.0169999999999995,"uhr":13.258203513423933,"loadForecast":null,"status":"Not Started"},{"id":"Zpvr6Sg","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"YzV2amg","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.4135999999999997,"eeRate":40.0,"w2Pay":1.2067999999999999,"uhr":33.14550878355983,"loadForecast":null,"status":"Not Started"}]},{"id":"lqPL2lV","customer":"Frontier","program":"Frontier FTTH-13 South","milestone":"Design Created","project":"TXBN-013","masterRate":34.48,"milestonePct":1.0,"milestoneRate":34.48,"uom":"Passing","uForecast":299.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"n1dFrYT","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":47.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-19","rdbHours":20.728715744680848,"fpyScore":null,"subRate":7.240799999999998,"eeRate":47.0,"w2Pay":3.620399999999999,"uhr":12.981990940227602,"loadForecast":23.03190638297872,"status":"Complete"},{"id":"tLPtsiO","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"nsd624M","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":232.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.8271999999999995,"eeRate":232.0,"w2Pay":2.4135999999999997,"uhr":96.12197547232351,"loadForecast":null,"status":"Not Started"},{"id":"AE86PWt","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"zjxUD0s","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":6.033999999999999,"eeRate":40.0,"w2Pay":3.0169999999999995,"uhr":13.258203513423933,"loadForecast":null,"status":"Not Started"},{"id":"RX4I8Ii","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"pmO50fS","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.4135999999999997,"eeRate":40.0,"w2Pay":1.2067999999999999,"uhr":33.14550878355983,"loadForecast":null,"status":"Not Started"}]},{"id":"EkXkSE4","customer":"Frontier","program":"Frontier FTTH-13 South","milestone":"Design Created","project":"TXBN-014","masterRate":34.48,"milestonePct":1.0,"milestoneRate":34.48,"uom":"Passing","uForecast":334.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"SID1u7a","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.3,"templateEeRate":47.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":29.587141276595737,"fpyScore":null,"subRate":7.240799999999998,"eeRate":47.0,"w2Pay":3.620399999999999,"uhr":12.981990940227602,"loadForecast":25.727948936170208,"status":"Complete"},{"id":"67h9DpL","name":"Fielding QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"m4IWxHw","name":"HLD","rdbtask":"Design/Design Hub","revPct":0.2,"templateEeRate":232.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":4.8271999999999995,"eeRate":232.0,"w2Pay":2.4135999999999997,"uhr":96.12197547232351,"loadForecast":null,"status":"Not Started"},{"id":"qFEg8D0","name":"HLD QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"4wzInjq","name":"Final Design","rdbtask":"Design/Design Hub","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":6.033999999999999,"eeRate":40.0,"w2Pay":3.0169999999999995,"uhr":13.258203513423933,"loadForecast":null,"status":"Not Started"},{"id":"5JzjuxZ","name":"Final Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.2067999999999999,"eeRate":44.0,"w2Pay":0.6033999999999999,"uhr":72.92011932383163,"loadForecast":null,"status":"Not Started"},{"id":"EOQpY7N","name":"Client Systems/Deliverable","rdbtask":"Client Operation Systems/Client Systems","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":2.4135999999999997,"eeRate":40.0,"w2Pay":1.2067999999999999,"uhr":33.14550878355983,"loadForecast":null,"status":"Not Started"}]},{"id":"9oQ0O1V","customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestone":"Design Submittal","project":"ARK-0103","masterRate":0.66,"milestonePct":0.5,"milestoneRate":0.33,"uom":"Foot","uForecast":17885.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"HNdc06P","name":"HLD","rdbtask":"Design/FIBER DESIGN","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-15","rdbHours":5.3192225625,"fpyScore":null,"subRate":0.0231,"eeRate":40.0,"w2Pay":0.01155,"uhr":3463.2034632034633,"loadForecast":5.16429375,"status":"Complete"},{"id":"Vz0oRaF","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.35,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.08084999999999999,"eeRate":44.0,"w2Pay":0.040424999999999996,"uhr":1088.43537414966,"loadForecast":null,"status":"Not Started"},{"id":"xMPMDEa","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01155,"eeRate":44.0,"w2Pay":0.005775,"uhr":7619.047619047619,"loadForecast":null,"status":"Not Started"},{"id":"IaGr8bY","name":"Design","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.42,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.09702,"eeRate":40.0,"w2Pay":0.04851,"uhr":824.5722531436818,"loadForecast":null,"status":"Not Started"},{"id":"PX4gfjl","name":"Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01155,"eeRate":44.0,"w2Pay":0.005775,"uhr":7619.047619047619,"loadForecast":null,"status":"Not Started"},{"id":"GYqyxzJ","name":"PM Closeout","rdbtask":"Project Management/Project Management","revPct":0.03,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0069299999999999995,"eeRate":64.0,"w2Pay":0.0034649999999999998,"uhr":18470.41847041847,"loadForecast":null,"status":"Not Started"}]},{"id":"USyekoZ","customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestone":"Permit Submitted","project":"ARK-0103","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","uForecast":17885.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"fxIdakE","name":"CAD Prints","rdbtask":"Design/Construction Prints","revPct":0.85,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-18","rdbHours":19.753423593749996,"fpyScore":null,"subRate":0.09817499999999998,"eeRate":40.0,"w2Pay":0.04908749999999999,"uhr":814.8714031066974,"loadForecast":21.948248437499995,"status":"Complete"},{"id":"AWJ1fGc","name":"CAD QC","rdbtask":"Design/Quality Control","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.005775,"eeRate":44.0,"w2Pay":0.0028875,"uhr":15238.095238095239,"loadForecast":null,"status":"Not Started"},{"id":"n13Dce5","name":"Permit Submission","rdbtask":"Permitting/Permit Application","revPct":0.07,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.008085,"eeRate":40.0,"w2Pay":0.0040425,"uhr":9894.86703772418,"loadForecast":null,"status":"Not Started"},{"id":"3Ic5t7K","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.03,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0034649999999999998,"eeRate":64.0,"w2Pay":0.0017324999999999999,"uhr":36940.83694083694,"loadForecast":null,"status":"Not Started"}]},{"id":"7yVbq9E","customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestone":"Permit Approved","project":"ARK-0103","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","uForecast":17885.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"y3uUi9S","name":"Follow Up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.9,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-20","rdbHours":22.077355781250002,"fpyScore":null,"subRate":0.10395,"eeRate":40.0,"w2Pay":0.051975,"uhr":769.6007696007696,"loadForecast":23.239321875,"status":"Complete"},{"id":"F8dBZvV","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01155,"eeRate":44.0,"w2Pay":0.005775,"uhr":7619.047619047619,"loadForecast":null,"status":"Not Started"}]},{"id":"lBIzbvf","customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestone":"Pole Data Collection","project":"ARK-0103","masterRate":20.0,"milestonePct":1.0,"milestoneRate":20.0,"uom":"Pole","uForecast":202.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"w6AQOfM","name":"Fielding","rdbtask":"Fielding/Fielding - Poles","revPct":0.85,"templateEeRate":45.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-15","rdbHours":28.044333333333334,"fpyScore":null,"subRate":11.9,"eeRate":45.0,"w2Pay":5.95,"uhr":7.563025210084033,"loadForecast":26.70888888888889,"status":"Complete"},{"id":"XSfjSNT","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.4000000000000001,"eeRate":44.0,"w2Pay":0.7000000000000001,"uhr":62.857142857142854,"loadForecast":null,"status":"Not Started"},{"id":"tgatwqi","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.7000000000000001,"eeRate":64.0,"w2Pay":0.35000000000000003,"uhr":182.85714285714283,"loadForecast":null,"status":"Not Started"}]},{"id":"pMKmgs6","customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestone":"PLA","project":"ARK-0103","masterRate":56.0,"milestonePct":1.0,"milestoneRate":56.0,"uom":"Pole","uForecast":202.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"Luxsyf3","name":"PLA","rdbtask":"Permitting/PLA - Before & After","revPct":0.85,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-19","rdbHours":100.9596,"fpyScore":null,"subRate":33.31999999999999,"eeRate":40.0,"w2Pay":16.659999999999997,"uhr":2.4009603841536618,"loadForecast":84.133,"status":"Complete"},{"id":"48Jkxis","name":"PLA QC","rdbtask":"Permitting/Permit QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":3.92,"eeRate":44.0,"w2Pay":1.96,"uhr":22.448979591836736,"loadForecast":null,"status":"Not Started"},{"id":"EdAAEep","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.96,"eeRate":64.0,"w2Pay":0.98,"uhr":65.3061224489796,"loadForecast":null,"status":"Not Started"}]},{"id":"8sREJpx","customer":"Hometown Internet","program":"Hometown Internet Arkansas Engineering","milestone":"As Builts","project":"ARK-0103","masterRate":0.05,"milestonePct":1.0,"milestoneRate":0.05,"uom":"Foot","uForecast":17885.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"uMXuuY1","name":"As built posting","rdbtask":"AsBuilts/Asbuilts","revPct":0.95,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":6.318435156249999,"fpyScore":null,"subRate":0.033249999999999995,"eeRate":40.0,"w2Pay":0.016624999999999997,"uhr":2406.015037593985,"loadForecast":7.433453124999999,"status":"Complete"},{"id":"8it6mt7","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0017499999999999998,"eeRate":44.0,"w2Pay":0.0008749999999999999,"uhr":50285.71428571429,"loadForecast":null,"status":"Not Started"}]},{"id":"8QyU7Aa","customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestone":"Design Submittal","project":"MOS-0205","masterRate":0.66,"milestonePct":0.5,"milestoneRate":0.33,"uom":"Foot","uForecast":18977.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"YyhIKHQ","name":"HLD","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":4.9316478749999995,"fpyScore":null,"subRate":0.0231,"eeRate":40.0,"w2Pay":0.01155,"uhr":3463.2034632034633,"loadForecast":5.47960875,"status":"Complete"},{"id":"I7CRBsQ","name":"Fielding","rdbtask":"Fielding/Field Notes","revPct":0.35,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.08084999999999999,"eeRate":44.0,"w2Pay":0.040424999999999996,"uhr":1088.43537414966,"loadForecast":null,"status":"Not Started"},{"id":"YXzENpO","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01155,"eeRate":44.0,"w2Pay":0.005775,"uhr":7619.047619047619,"loadForecast":null,"status":"Not Started"},{"id":"SWe9DyF","name":"Design","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.42,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.09702,"eeRate":40.0,"w2Pay":0.04851,"uhr":824.5722531436818,"loadForecast":null,"status":"Not Started"},{"id":"5QHXw3H","name":"Design QC","rdbtask":"Quality Control/Design QC","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01155,"eeRate":44.0,"w2Pay":0.005775,"uhr":7619.047619047619,"loadForecast":null,"status":"Not Started"},{"id":"NfVOwOc","name":"PM Closeout","rdbtask":"Project Management/Project Management","revPct":0.03,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0069299999999999995,"eeRate":64.0,"w2Pay":0.0034649999999999998,"uhr":18470.41847041847,"loadForecast":null,"status":"Not Started"}]},{"id":"h0OPk9p","customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestone":"Permit Submitted","project":"MOS-0205","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","uForecast":18977.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"qFGJJBy","name":"CAD Prints","rdbtask":"Design/Construction Prints","revPct":0.85,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-18","rdbHours":26.78158776562499,"fpyScore":null,"subRate":0.09817499999999998,"eeRate":40.0,"w2Pay":0.04908749999999999,"uhr":814.8714031066974,"loadForecast":23.288337187499994,"status":"Complete"},{"id":"VKFvbgz","name":"CAD QC","rdbtask":"Design/Quality Control","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.005775,"eeRate":44.0,"w2Pay":0.0028875,"uhr":15238.095238095239,"loadForecast":null,"status":"Not Started"},{"id":"7h6itCm","name":"Permit Submission","rdbtask":"Permitting/Permit Application","revPct":0.07,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.008085,"eeRate":40.0,"w2Pay":0.0040425,"uhr":9894.86703772418,"loadForecast":null,"status":"Not Started"},{"id":"DDBRtsY","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.03,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0034649999999999998,"eeRate":64.0,"w2Pay":0.0017324999999999999,"uhr":36940.83694083694,"loadForecast":null,"status":"Not Started"}]},{"id":"RmUYdg2","customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestone":"Permit Approved","project":"MOS-0205","masterRate":0.66,"milestonePct":0.25,"milestoneRate":0.165,"uom":"Foot","uForecast":18977.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"kjI7ozl","name":"Follow Up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.9,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-20","rdbHours":25.39798655625,"fpyScore":null,"subRate":0.10395,"eeRate":40.0,"w2Pay":0.051975,"uhr":769.6007696007696,"loadForecast":24.658239375,"status":"Complete"},{"id":"NAbMmKy","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01155,"eeRate":44.0,"w2Pay":0.005775,"uhr":7619.047619047619,"loadForecast":null,"status":"Not Started"}]},{"id":"lQFzixl","customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestone":"Pole Data Collection","project":"MOS-0205","masterRate":20.0,"milestonePct":1.0,"milestoneRate":20.0,"uom":"Pole","uForecast":177.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"luCq1GN","name":"Fielding","rdbtask":"Fielding/Fielding - Poles","revPct":0.85,"templateEeRate":45.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":21.063,"fpyScore":null,"subRate":11.9,"eeRate":45.0,"w2Pay":5.95,"uhr":7.563025210084033,"loadForecast":23.403333333333332,"status":"Complete"},{"id":"LLKv0MY","name":"Field QC","rdbtask":"Fielding/Field QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.4000000000000001,"eeRate":44.0,"w2Pay":0.7000000000000001,"uhr":62.857142857142854,"loadForecast":null,"status":"Not Started"},{"id":"RsMfihs","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.7000000000000001,"eeRate":64.0,"w2Pay":0.35000000000000003,"uhr":182.85714285714283,"loadForecast":null,"status":"Not Started"}]},{"id":"fbVsrHk","customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestone":"PLA","project":"MOS-0205","masterRate":56.0,"milestonePct":1.0,"milestoneRate":56.0,"uom":"Pole","uForecast":59.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"NQO9IEi","name":"PLA","rdbtask":"Permitting/PLA - Before & After","revPct":0.85,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-19","rdbHours":23.344824999999993,"fpyScore":null,"subRate":33.31999999999999,"eeRate":40.0,"w2Pay":16.659999999999997,"uhr":2.4009603841536618,"loadForecast":24.573499999999996,"status":"Complete"},{"id":"tBdwaiY","name":"PLA QC","rdbtask":"Permitting/Permit QC","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":3.92,"eeRate":44.0,"w2Pay":1.96,"uhr":22.448979591836736,"loadForecast":null,"status":"Not Started"},{"id":"7FEQz0E","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":1.96,"eeRate":64.0,"w2Pay":0.98,"uhr":65.3061224489796,"loadForecast":null,"status":"Not Started"}]},{"id":"gZUs9Bv","customer":"Hometown Internet","program":"Hometown Internet Missouri Engineering","milestone":"As Builts","project":"MOS-0205","masterRate":0.05,"milestonePct":1.0,"milestoneRate":0.05,"uom":"Foot","uForecast":18977.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"CUVIhhW","name":"As built posting","rdbtask":"AsBuilts/Asbuilts","revPct":0.95,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":8.28168140625,"fpyScore":null,"subRate":0.033249999999999995,"eeRate":40.0,"w2Pay":0.016624999999999997,"uhr":2406.015037593985,"loadForecast":7.887315624999999,"status":"Complete"},{"id":"ZwZcSH9","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0017499999999999998,"eeRate":44.0,"w2Pay":0.0008749999999999999,"uhr":50285.71428571429,"loadForecast":null,"status":"Not Started"}]},{"id":"ZVPEJqz","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Mid Level Design - UG","project":"RPA-051","masterRate":0.89,"milestonePct":0.25,"milestoneRate":0.2225,"uom":"Foot","uForecast":20178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"YB9WoYK","name":"Arc","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-15","rdbHours":4.71408525,"fpyScore":null,"subRate":0.015575,"eeRate":40.0,"w2Pay":0.0077875,"uhr":5136.4365971107545,"loadForecast":3.928404375,"status":"Complete"},{"id":"vSNkimm","name":"Fielding","rdbtask":"Fielding/FIELD DATA COLLECTION","revPct":0.5,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.077875,"eeRate":44.0,"w2Pay":0.0389375,"uhr":1130.016051364366,"loadForecast":null,"status":"Not Started"},{"id":"dvrHuRr","name":"Design","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0389375,"eeRate":40.0,"w2Pay":0.01946875,"uhr":2054.5746388443017,"loadForecast":null,"status":"Not Started"},{"id":"q19Qf7W","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.015575,"eeRate":44.0,"w2Pay":0.0077875,"uhr":5650.08025682183,"loadForecast":null,"status":"Not Started"},{"id":"491h1pS","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0077875,"eeRate":64.0,"w2Pay":0.00389375,"uhr":16436.597110754414,"loadForecast":null,"status":"Not Started"}]},{"id":"vQdgWCh","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Final Design - UG","project":"RPA-051","masterRate":0.89,"milestonePct":0.2,"milestoneRate":0.17800000000000002,"uom":"Foot","uForecast":20178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"CN2fFr6","name":"Final Fiber uploaded into ARC","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.5,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-18","rdbHours":13.356574875,"fpyScore":null,"subRate":0.0623,"eeRate":40.0,"w2Pay":0.03115,"uhr":1284.1091492776886,"loadForecast":15.7136175,"status":"Complete"},{"id":"w6uaVTT","name":"UG Construction Prints","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.3,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.03738,"eeRate":44.0,"w2Pay":0.01869,"uhr":2354.200107009096,"loadForecast":null,"status":"Not Started"},{"id":"CPwdHnA","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01869,"eeRate":44.0,"w2Pay":0.009345,"uhr":4708.400214018192,"loadForecast":null,"status":"Not Started"},{"id":"nqZuJJE","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.00623,"eeRate":64.0,"w2Pay":0.003115,"uhr":20545.746388443018,"loadForecast":null,"status":"Not Started"}]},{"id":"RaDioQa","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Permit Submitted - UG","project":"RPA-051","masterRate":0.89,"milestonePct":0.2,"milestoneRate":0.17800000000000002,"uom":"Foot","uForecast":20178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"1Ba7mQi","name":"Submit UG Permits","rdbtask":"Permitting/Permit Prints","revPct":0.6,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-20","rdbHours":16.970706899999996,"fpyScore":null,"subRate":0.07476,"eeRate":40.0,"w2Pay":0.03738,"uhr":1070.0909577314073,"loadForecast":18.856340999999997,"status":"Complete"},{"id":"Oj5qOpx","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.3,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.03738,"eeRate":44.0,"w2Pay":0.01869,"uhr":2354.200107009096,"loadForecast":null,"status":"Not Started"},{"id":"4kysRoO","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01246,"eeRate":40.0,"w2Pay":0.00623,"uhr":6420.545746388443,"loadForecast":null,"status":"Not Started"}]},{"id":"SMjzQ1f","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Permit Approved - UG","project":"RPA-051","masterRate":0.89,"milestonePct":0.25,"milestoneRate":0.2225,"uom":"Foot","uForecast":20178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"RY9Aiex","name":"Finalize construction prints","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.8,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-19","actualDate":"2026-03-15","rdbHours":36.14132025,"fpyScore":null,"subRate":0.1246,"eeRate":40.0,"w2Pay":0.0623,"uhr":642.0545746388443,"loadForecast":31.427235,"status":"Complete"},{"id":"Tgt2iVU","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.023362499999999998,"eeRate":44.0,"w2Pay":0.011681249999999999,"uhr":3766.7201712145534,"loadForecast":null,"status":"Not Started"},{"id":"i9iGaOB","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.0077875,"eeRate":64.0,"w2Pay":0.00389375,"uhr":16436.597110754414,"loadForecast":null,"status":"Not Started"}]},{"id":"d37EgEK","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"As Builts - UG","project":"RPA-051","masterRate":0.89,"milestonePct":0.1,"milestoneRate":0.08900000000000001,"uom":"Foot","uForecast":20178.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"gUKx7ti","name":"Posting to client system","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.75,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-19","rdbHours":12.138769518750001,"fpyScore":null,"subRate":0.046725,"eeRate":40.0,"w2Pay":0.0233625,"uhr":1712.1455323702514,"loadForecast":11.785213125,"status":"Complete"},{"id":"rfILLWQ","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.2,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.01246,"eeRate":44.0,"w2Pay":0.00623,"uhr":7062.600321027287,"loadForecast":null,"status":"Not Started"},{"id":"0OsGFUs","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.003115,"eeRate":64.0,"w2Pay":0.0015575,"uhr":41091.492776886036,"loadForecast":null,"status":"Not Started"}]},{"id":"QeRT0df","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Mid Level Design - AER","project":"RPA-032","masterRate":1.38,"milestonePct":0.25,"milestoneRate":0.345,"uom":"Foot","uForecast":19978.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"G895i1J","name":"Arc","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.1,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-16","actualDate":"2026-03-15","rdbHours":5.4277728750000005,"fpyScore":null,"subRate":0.024149999999999998,"eeRate":40.0,"w2Pay":0.012074999999999999,"uhr":3312.6293995859214,"loadForecast":6.03085875,"status":"Complete"},{"id":"wQV7Vbe","name":"Fielding","rdbtask":"Fielding/FIELD DATA COLLECTION","revPct":0.5,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.12074999999999998,"eeRate":44.0,"w2Pay":0.06037499999999999,"uhr":728.7784679089028,"loadForecast":null,"status":"Not Started"},{"id":"qcdWFMF","name":"Design","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.06037499999999999,"eeRate":40.0,"w2Pay":0.030187499999999996,"uhr":1325.0517598343688,"loadForecast":null,"status":"Not Started"},{"id":"zRfHMrt","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.1,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.024149999999999998,"eeRate":44.0,"w2Pay":0.012074999999999999,"uhr":3643.8923395445136,"loadForecast":null,"status":"Not Started"},{"id":"FmYHyNZ","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.012074999999999999,"eeRate":64.0,"w2Pay":0.0060374999999999995,"uhr":10600.414078674949,"loadForecast":null,"status":"Not Started"}]},{"id":"wEJwpgJ","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Final Design - AER","project":"RPA-032","masterRate":1.38,"milestonePct":0.2,"milestoneRate":0.27599999999999997,"uom":"Foot","uForecast":19978.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"ACLtTTh","name":"Final Fiber uploaded into ARC","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.5,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-15","rdbHours":22.917263249999998,"fpyScore":null,"subRate":0.09659999999999998,"eeRate":40.0,"w2Pay":0.04829999999999999,"uhr":828.1573498964805,"loadForecast":24.123434999999997,"status":"Complete"},{"id":"RRk7GWS","name":"UG Construction Prints","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.3,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.057959999999999984,"eeRate":44.0,"w2Pay":0.028979999999999992,"uhr":1518.2884748102144,"loadForecast":null,"status":"Not Started"},{"id":"khWq2Vb","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.028979999999999992,"eeRate":44.0,"w2Pay":0.014489999999999996,"uhr":3036.576949620429,"loadForecast":null,"status":"Not Started"},{"id":"YqdSJeC","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.009659999999999998,"eeRate":64.0,"w2Pay":0.004829999999999999,"uhr":13250.517598343687,"loadForecast":null,"status":"Not Started"}]},{"id":"Cr0uIam","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Permit Submitted - AER","project":"RPA-032","masterRate":1.38,"milestonePct":0.2,"milestoneRate":0.27599999999999997,"uom":"Foot","uForecast":19978.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"SoFc1pD","name":"PLA","rdbtask":"Permitting/AERIAL PERMITTING - BASIC","revPct":0.4,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-17","actualDate":"2026-03-18","rdbHours":20.263685399999996,"fpyScore":null,"subRate":0.07727999999999999,"eeRate":40.0,"w2Pay":0.038639999999999994,"uhr":1035.1966873706006,"loadForecast":19.298747999999996,"status":"Complete"},{"id":"xj51I4T","name":"Submit AE Permits","rdbtask":"Permitting/Permit Application","revPct":0.3,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.057959999999999984,"eeRate":44.0,"w2Pay":0.028979999999999992,"uhr":1518.2884748102144,"loadForecast":null,"status":"Not Started"},{"id":"AtzSqex","name":"Follow-up to Approval","rdbtask":"Permitting/Permit Application","revPct":0.25,"templateEeRate":40.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.04829999999999999,"eeRate":40.0,"w2Pay":0.024149999999999994,"uhr":1656.314699792961,"loadForecast":null,"status":"Not Started"},{"id":"F3lX87e","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.009659999999999998,"eeRate":64.0,"w2Pay":0.004829999999999999,"uhr":13250.517598343687,"loadForecast":null,"status":"Not Started"}]},{"id":"TgGoEd9","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"Permit Approved - AER","project":"RPA-032","masterRate":1.38,"milestonePct":0.25,"milestoneRate":0.345,"uom":"Foot","uForecast":19978.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"IsMCKEV","name":"Finalize construction prints","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.8,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-15","actualDate":"2026-03-20","rdbHours":57.896243999999996,"fpyScore":null,"subRate":0.19319999999999998,"eeRate":40.0,"w2Pay":0.09659999999999999,"uhr":414.0786749482402,"loadForecast":48.24687,"status":"Complete"},{"id":"m3Vpazo","name":"QC","rdbtask":"Design/CAD OF DESIGN/CD CREATION","revPct":0.15,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.03622499999999999,"eeRate":44.0,"w2Pay":0.018112499999999997,"uhr":2429.261559696343,"loadForecast":null,"status":"Not Started"},{"id":"v026aO0","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.012074999999999999,"eeRate":64.0,"w2Pay":0.0060374999999999995,"uhr":10600.414078674949,"loadForecast":null,"status":"Not Started"}]},{"id":"TtqemWK","customer":"Sky Fiber","program":"Sky Fiber Engineering","milestone":"As Builts - AER","project":"RPA-032","masterRate":1.38,"milestonePct":0.1,"milestoneRate":0.13799999999999998,"uom":"Foot","uForecast":19978.0,"finalUnits":null,"w2ProdTarget":0.35,"subProdTarget":0.7,"tasks":[{"id":"Sf53GRx","name":"Posting to client system","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.75,"templateEeRate":40.0,"resource":null,"ecd":"2026-03-18","actualDate":"2026-03-15","rdbHours":15.378689812499998,"fpyScore":null,"subRate":0.07244999999999999,"eeRate":40.0,"w2Pay":0.03622499999999999,"uhr":1104.209799861974,"loadForecast":18.092576249999997,"status":"Complete"},{"id":"8ffiYeJ","name":"QC","rdbtask":"Design/FIBER DESIGN (CREATED IN GIS)","revPct":0.2,"templateEeRate":44.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.019319999999999997,"eeRate":44.0,"w2Pay":0.009659999999999998,"uhr":4554.865424430643,"loadForecast":null,"status":"Not Started"},{"id":"A7oqtXR","name":"PM Closeout","rdbtask":"Project Management/PROJECT MANAGEMENT","revPct":0.05,"templateEeRate":64.0,"resource":null,"ecd":null,"actualDate":null,"rdbHours":null,"fpyScore":null,"subRate":0.004829999999999999,"eeRate":64.0,"w2Pay":0.0024149999999999996,"uhr":26501.035196687375,"loadForecast":null,"status":"Not Started"}]}];
}


export default function App() {
  const {
    projects, setProjects,
    roster,   setRoster,
    loadStatus, saveStatus
  } = useSupabase(buildDemo(), ROSTER);
  const [tab, setTab] = useState("projects");
  const [open, setOpen] = useState(new Set());
  const [search, setSearch] = useState("");
  const [fCust, setFCust] = useState(""); const [fProg, setFProg] = useState("");
  const [fRes, setFRes] = useState(""); const [fStat, setFStat] = useState("");
  const [showNP, setShowNP] = useState(false); const [showRoster, setShowRoster] = useState(false);
  const [npProg, setNpProg] = useState(""); const [npMs, setNpMs] = useState("");
  const [npName, setNpName] = useState(""); const [npUnits, setNpUnits] = useState("");
  const [npW2, setNpW2] = useState(""); const [npSub, setNpSub] = useState("");
  const [newEmp, setNewEmp] = useState({name:"",id:"",org:"Designer",title:"",rate:"",tasks:""});
  const fileRef = useRef();

  const rcEntry = useMemo(()=>RATE_CARD.find(p=>p.program===npProg),[npProg]);
  const rcMs = useMemo(()=>rcEntry?.milestones||[],[rcEntry]);
  const selMs = useMemo(()=>rcMs.find(m=>m.name===npMs),[rcMs,npMs]);

  const customers = useMemo(()=>[...new Set(RATE_CARD.map(p=>p.customer))].sort(),[]);
  const allResNames = useMemo(()=>[...new Set(roster.map(r=>r.name))].sort(),[roster]);
  const progFiltered = useMemo(()=>{
    const src=fCust?projects.filter(p=>p.customer===fCust):projects;
    return [...new Set(src.map(p=>p.program))].sort();
  },[projects,fCust]);

  const filtered = useMemo(()=>projects.filter(p=>{
    if(fCust&&p.customer!==fCust)return false;
    if(fProg&&p.program!==fProg)return false;
    if(fRes&&!p.tasks.some(t=>t.resource===fRes))return false;
    if(fStat&&!p.tasks.some(t=>t.status===fStat))return false;
    if(search){const q=search.toLowerCase();if(![p.customer,p.program,p.milestone,p.project].join(" ").toLowerCase().includes(q))return false;}
    return true;
  }),[projects,fCust,fProg,fRes,fStat,search]);

  const metrics = useMemo(()=>{
    const custs=new Set(filtered.map(p=>p.customer)); const res=new Set();
    let unassigned=0,rdbIssues=0,totalRev=0;
    filtered.forEach(p=>{
      const u=p.finalUnits??p.uForecast??0; totalRev+=p.milestoneRate*u;
      p.tasks.forEach(t=>{
        if(t.resource)res.add(t.resource);else unassigned++;
        const f=rdbFlag(t.loadForecast,t.rdbHours);if(f&&f.label!=="On Track")rdbIssues++;
      });
    });
    return {projects:filtered.length,customers:custs.size,resources:res.size,unassigned,rdbIssues,totalRev};
  },[filtered]);

  const updProj = useCallback((pid,field,val)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==pid)return p;
      const u={...p,[field]:val};
      if(field==="uForecast"||field==="finalUnits"){u.tasks=recompute(u,roster);}
      return u;
    }));
  },[roster]);

  const updTask = useCallback((pid,tid,field,val)=>{
    setProjects(prev=>prev.map(p=>{
      if(p.id!==pid)return p;
      const tasks=p.tasks.map(t=>{
        if(t.id!==tid)return t;
        const u={...t,[field]:val};
        if(field==="resource"){
          const rate=val?(roster.find(r=>r.name===val)?.rate??null):null;
          const units=p.finalUnits??p.uForecast??null;
          return {...u,...calcTask(u,p.milestoneRate,p.w2ProdTarget,p.subProdTarget,units,rate)};
        }
        return u;
      });
      return {...p,tasks};
    }));
  },[roster]);

  const createProj = ()=>{
    if(!rcEntry||!npName.trim())return;
    const uF=npUnits?parseFloat(npUnits):null;
    const w2=npW2?parseFloat(npW2):null;
    const sub=npSub?parseFloat(npSub):null;
    const newProjects = rcEntry.milestones.map(ms =>
      buildProject(rcEntry, ms, npName.trim(), uF, w2, sub)
    );
    setProjects(prev=>[...newProjects,...prev]);
    setOpen(prev=>new Set([...prev,...newProjects.map(p=>p.id)]));
    setShowNP(false);setNpProg("");setNpName("");setNpUnits("");setNpW2("");setNpSub("");
  };

  const deleteProj = useCallback((pid)=>{
    setProjects(prev=>prev.filter(p=>p.id!==pid));
    setOpen(prev=>{const s=new Set(prev);s.delete(pid);return s;});
  },[]);

  const addEmp = ()=>{
    if(!newEmp.name.trim())return;
    const e={id:newEmp.id||"NEW"+Date.now(),name:newEmp.name.trim(),rate:parseFloat(newEmp.rate)||0,
      org:newEmp.org,title:newEmp.title,location:"",
      taskTypes:newEmp.tasks.split(",").map(t=>t.trim().toLowerCase()).filter(t=>["production","qc","permitting","pm","fielding"].includes(t))};
    setRoster(prev=>[...prev,e].sort((a,b)=>a.name.localeCompare(b.name)));
    setNewEmp({name:"",id:"",org:"Designer",title:"",rate:"",tasks:""});
  };

  const IS = (s={})=>({height:32,padding:"0 10px",border:"0.5px solid #ccc9c0",borderRadius:7,background:"#fff",fontSize:13,color:"#1a1a18",outline:"none",...s});

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",minHeight:"100vh",background:"#f8f7f4",color:"#1a1a18"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} input,select{font-family:inherit} select{appearance:none;cursor:pointer}
        .hr:hover{background:#f0ede8!important} .ch:hover{background:#efece7!important}
        .yi{background:#fffbe6!important;border-color:#e8c84a!important}
        .yi:focus{outline:2px solid #e8c84a!important;outline-offset:1px}
      `}</style>

      <div style={{background:"#1a1a18",color:"#f8f7f4",padding:"0 24px",display:"flex",alignItems:"center",gap:16,height:52}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:500,letterSpacing:2,color:"#c8c5be",textTransform:"uppercase"}}>Crew Loading Master</span>
        <div style={{flex:1}}/>
        {/* DB status indicator */}
        {loadStatus==="loading"&&<span style={{fontSize:11,color:"#888780"}}>Loading...</span>}
        {loadStatus==="error"&&<span style={{fontSize:11,color:"#E24B4A",background:"rgba(226,75,74,0.15)",padding:"2px 8px",borderRadius:4}}>Load error</span>}
        {loadStatus==="no-db"&&<span style={{fontSize:11,color:"#e8c84a",background:"rgba(232,200,74,0.15)",padding:"2px 8px",borderRadius:4}}>Local only</span>}
        {saveStatus==="saving"&&<span style={{fontSize:11,color:"#888780"}}>Saving...</span>}
        {saveStatus==="saved"&&<span style={{fontSize:11,color:"#90c060",background:"rgba(144,192,96,0.15)",padding:"2px 8px",borderRadius:4}}>Saved</span>}
        {saveStatus==="error"&&<span style={{fontSize:11,color:"#E24B4A",background:"rgba(226,75,74,0.15)",padding:"2px 8px",borderRadius:4}}>Save error</span>}
        <button onClick={()=>setShowNP(true)} style={{fontSize:12,padding:"5px 14px",border:"1px solid #5a8a3a",borderRadius:6,background:"#2a3a1e",color:"#90c060",cursor:"pointer",fontWeight:500}}>+ New Project</button>
        <button onClick={()=>setShowRoster(true)} style={{fontSize:12,padding:"5px 12px",border:"1px solid #3a3a36",borderRadius:6,background:"transparent",color:"#c8c5be",cursor:"pointer"}}>Roster ({roster.length})</button>
        <input ref={fileRef} type="file" accept=".xlsx,.csv" style={{display:"none"}} onChange={()=>{}}/>
      </div>

      <div style={{padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:20}}>
          {[
            {l:"Projects",v:metrics.projects,s:"in view"},
            {l:"Customers",v:metrics.customers,s:"active"},
            {l:"Resources",v:metrics.resources,s:"assigned"},
            {l:"Unassigned",v:metrics.unassigned,s:"task slots",w:metrics.unassigned>0},
            {l:"RDB Issues",v:metrics.rdbIssues,s:"over/under",w:metrics.rdbIssues>0},
            {l:"Forecast Rev",v:"$"+Math.round(metrics.totalRev).toLocaleString(),s:"all filtered",big:true},
          ].map(m=>(
            <div key={m.l} style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#888780",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{m.l}</div>
              <div style={{fontSize:m.big?18:24,fontWeight:600,color:m.w&&m.v>0?"#A32D2D":"#1a1a18"}}>{m.v}</div>
              <div style={{fontSize:11,color:"#aaa89e",marginTop:2}}>{m.s}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search project, milestone, customer..." style={{flex:1,minWidth:200,...IS()}}/>
          {[
            {v:fCust,fn:v=>{setFCust(v);setFProg("");},opts:customers,ph:"All customers"},
            {v:fProg,fn:v=>setFProg(v),opts:progFiltered,ph:"All programs"},
            {v:fRes,fn:v=>setFRes(v),opts:allResNames,ph:"All resources"},
            {v:fStat,fn:v=>setFStat(v),opts:STATUS_OPTS,ph:"All statuses"},
          ].map((f,i)=>(
            <div key={i} style={{position:"relative"}}>
              <select value={f.v} onChange={e=>f.fn(e.target.value)} style={{...IS({minWidth:140,paddingRight:28})}}>
                <option value="">{f.ph}</option>
                {f.opts.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <span style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:"#888780"}}>v</span>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:2,marginBottom:16,borderBottom:"1px solid #dddbd4"}}>
          {[["projects","Projects"],["resources","Resource View"],["rdb","RDB Reconciliation"],["revenue","Revenue Forecast"],["actual","Actual Revenue"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 18px",fontSize:13,border:"none",
              background:tab===id?"#fff":"transparent",borderRadius:"8px 8px 0 0",cursor:"pointer",
              color:tab===id?"#1a1a18":"#888780",fontWeight:tab===id?500:400,
              borderTop:tab===id?"1px solid #dddbd4":"none",borderLeft:tab===id?"1px solid #dddbd4":"none",
              borderRight:tab===id?"1px solid #dddbd4":"none",marginBottom:tab===id?-1:0}}>{lbl}</button>
          ))}
        </div>

        {/* Export bar */}
        <ExportBar tab={tab} projects={tab==="projects"||tab==="rdb"?filtered:projects} roster={roster}/>

        {tab==="projects"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.length===0&&<div style={{textAlign:"center",padding:"3rem",color:"#aaa89e"}}>No projects match your filters.</div>}
            {filtered.map(p=><ProjCard key={p.id} p={p} isOpen={open.has(p.id)}
              onToggle={()=>setOpen(prev=>{const s=new Set(prev);s.has(p.id)?s.delete(p.id):s.add(p.id);return s;})}
              updProj={updProj} updTask={updTask} roster={roster} deleteProj={deleteProj}/>)}
          </div>
        )}
        {tab==="resources"&&<ResView projects={filtered} roster={roster} updTask={updTask}/>}
        {tab==="rdb"&&<RDBView projects={filtered} updTask={updTask}/>}
        {tab==="revenue"&&<RevenueView projects={projects}/>}
        {tab==="actual"&&<ActualRevenueView projects={projects} updTask={updTask}/>}
      </div>

      {showNP&&(
        <Modal onClose={()=>setShowNP(false)} title="Create New Project" w={620}>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:12,color:"#888780",background:"#f8f7f4",borderRadius:6,padding:"8px 10px"}}>
              Select an approved program -- rates and task structure load automatically from the master rate card.
            </div>

            <label style={{fontSize:12,fontWeight:500,color:"#555"}}>Program <span style={{color:"#A32D2D"}}>*</span></label>
            <Sel value={npProg} onChange={v=>{setNpProg(v);}} opts={RATE_CARD.map(p=>({v:p.program,l:`${p.customer} / ${p.program}`}))} ph="-- Select program --"/>

            {rcEntry&&(
              <div style={{background:"#f0ede8",borderRadius:8,padding:"10px 12px",fontSize:12}}>
                <div style={{fontWeight:500,color:"#555",marginBottom:6}}>{rcEntry.milestones.length} milestones will be created:</div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {rcEntry.milestones.map(m=>(
                    <div key={m.name} style={{display:"flex",justifyContent:"space-between",color:"#555"}}>
                      <span>{m.name}</span>
                      <span style={{color:"#888780",fontFamily:"'DM Mono',monospace"}}>{fmtR(m.milestoneRate)}/{m.uom}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label style={{fontSize:12,fontWeight:500,color:"#555"}}>Project name / ID <span style={{color:"#A32D2D"}}>*</span> <YD/></label>
            <input value={npName} onChange={e=>setNpName(e.target.value)} placeholder="e.g. MXAULMNA" className="yi" style={IS({width:"100%"})}/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:"#555",display:"block",marginBottom:3}}>Unit forecast <YD/></label>
                <input type="number" value={npUnits} onChange={e=>setNpUnits(e.target.value)} placeholder={rcEntry?.milestones[0]?.uom||"units"} className="yi" style={IS({width:"100%"})}/>
                <div style={{fontSize:10,color:"#aaa89e",marginTop:2}}>Drives revenue & load forecast</div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:"#555",display:"block",marginBottom:3}}>W2 prod. target</label>
                <input type="number" value={npW2} onChange={e=>setNpW2(e.target.value)} placeholder={rcEntry?.milestones[0]?.w2ProdTarget||"0.35"} style={IS({width:"100%"})}/>
                <div style={{fontSize:10,color:"#aaa89e",marginTop:2}}>Default: {rcEntry?.milestones[0]?.w2ProdTarget||"-"}</div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:"#555",display:"block",marginBottom:3}}>Sub prod. target</label>
                <input type="number" value={npSub} onChange={e=>setNpSub(e.target.value)} placeholder={rcEntry?.milestones[0]?.subProdTarget||"0.70"} style={IS({width:"100%"})}/>
                <div style={{fontSize:10,color:"#aaa89e",marginTop:2}}>Default: {rcEntry?.milestones[0]?.subProdTarget||"-"}</div>
              </div>
            </div>

            {rcEntry&&npUnits&&(
              <div style={{background:"#EAF3DE",borderRadius:8,padding:"10px 12px",fontSize:12}}>
                <strong style={{color:"#3B6D11"}}>Forecast revenue (all milestones): </strong>
                <span style={{color:"#3B6D11",fontWeight:600}}>
                  ${Math.round(rcEntry.milestones.reduce((s,m)=>s+m.milestoneRate*parseFloat(npUnits),0)).toLocaleString()}
                </span>
                <span style={{color:"#888780",marginLeft:8,fontSize:11}}>across {rcEntry.milestones.length} milestone{rcEntry.milestones.length!==1?"s":""}</span>
              </div>
            )}

            <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:4}}>
              <button onClick={()=>setShowNP(false)} style={IS({cursor:"pointer",padding:"0 16px"})}>Cancel</button>
              <button onClick={createProj} disabled={!rcEntry||!npName.trim()} style={{height:32,padding:"0 20px",
                background:(!rcEntry||!npName.trim())?"#ccc":"#1a1a18",color:"#fff",border:"none",borderRadius:7,fontSize:13,cursor:"pointer",fontWeight:500}}>
                Create {rcEntry?.milestones.length||""} Milestone{(rcEntry?.milestones.length||0)!==1?"s":""}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showRoster&&(
        <Modal onClose={()=>setShowRoster(false)} title={`Manage Roster -- ${roster.length} employees`} w={740}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid #eee",background:"#f8f7f4"}}>
            <div style={{fontSize:11,fontWeight:500,color:"#888780",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Add employee</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 80px 1fr 90px",gap:8,marginBottom:8}}>
              <input value={newEmp.name} onChange={e=>setNewEmp(p=>({...p,name:e.target.value}))} placeholder="Last, First" style={IS({width:"100%"})}/>
              <input value={newEmp.id} onChange={e=>setNewEmp(p=>({...p,id:e.target.value}))} placeholder="EE ID" style={IS({width:"100%"})}/>
              <input value={newEmp.title} onChange={e=>setNewEmp(p=>({...p,title:e.target.value}))} placeholder="Job title" style={IS({width:"100%"})}/>
              <input value={newEmp.rate} onChange={e=>setNewEmp(p=>({...p,rate:e.target.value}))} placeholder="$/hr" type="number" style={IS({width:"100%"})}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
              <input value={newEmp.tasks} onChange={e=>setNewEmp(p=>({...p,tasks:e.target.value}))} placeholder="Functions comma separated: production, qc, permitting, pm, fielding" style={IS({width:"100%"})}/>
              <button onClick={addEmp} style={{padding:"0 16px",background:"#1a1a18",color:"#fff",border:"none",borderRadius:7,fontSize:13,cursor:"pointer",fontWeight:500}}>Add</button>
            </div>
          </div>
          <div style={{overflowY:"auto",maxHeight:400}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:"#f8f7f4",position:"sticky",top:0}}>
                {["Name","ID","Title","Location","$/hr","Functions"].map(h=>(
                  <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#888780",fontWeight:500,borderBottom:"1px solid #eee",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{roster.map(r=>(
                <tr key={r.id} className="hr" style={{borderBottom:"0.5px solid #f0ede8"}}>
                  <td style={{padding:"7px 12px",fontWeight:500}}>{r.name}</td>
                  <td style={{padding:"7px 12px",color:"#888780",fontFamily:"'DM Mono',monospace"}}>{r.id}</td>
                  <td style={{padding:"7px 12px",color:"#555"}}>{r.title}</td>
                  <td style={{padding:"7px 12px",color:"#888780",fontSize:11}}>{r.location||"-"}</td>
                  <td style={{padding:"7px 12px"}}>${r.rate.toFixed(2)}</td>
                  <td style={{padding:"7px 12px"}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(r.taskTypes||[]).map(t=>{const s=TASK_TYPE_STYLE[t]||{label:t,color:"#555",bg:"#eee"};return <span key={t} style={{fontSize:10,padding:"1px 6px",borderRadius:3,background:s.bg,color:s.color,fontWeight:600,textTransform:"uppercase"}}>{s.label}</span>;})}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div style={{padding:"12px 20px",borderTop:"1px solid #eee",display:"flex",justifyContent:"space-between"}}>
            <button onClick={()=>fileRef.current?.click()} style={IS({cursor:"pointer",padding:"0 14px"})}>^ Replace roster from file</button>
            <button onClick={()=>setShowRoster(false)} style={{height:32,padding:"0 20px",background:"#1a1a18",color:"#fff",border:"none",borderRadius:7,fontSize:13,cursor:"pointer"}}>Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProjCard({p, isOpen, onToggle, updProj, updTask, roster, deleteProj}) {
  const assigned=p.tasks.filter(t=>t.resource).length;
  const pctDone=p.tasks.length>0?Math.round(p.tasks.filter(t=>t.status==="Complete").length/p.tasks.length*100):0;
  const anyIssue=p.tasks.some(t=>{const f=rdbFlag(t.loadForecast,t.rdbHours);return f&&f.label!=="On Track";});
  const units=p.finalUnits??p.uForecast??null;
  const fRev=units!=null?p.milestoneRate*units:null;

  return (
    <div style={{background:"#fff",border:`0.5px solid ${pctDone===100?"#b0d890":"#dddbd4"}`,borderRadius:12,overflow:"hidden"}}>
      <div className="ch" onClick={onToggle} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",cursor:"pointer"}}>
        <span style={{fontSize:11,color:"#aaa89e",transform:isOpen?"rotate(90deg)":"none",display:"inline-block",transition:"transform .15s"}}>></span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:500}}>{p.milestone}</div>
          <div style={{fontSize:12,color:"#888780",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {p.customer} * {p.program}
            {p.project&&<span style={{marginLeft:6,fontFamily:"'DM Mono',monospace",fontSize:11,background:"#f0ede8",padding:"1px 6px",borderRadius:4,color:"#555"}}>{p.project}</span>}
          </div>
        </div>
        <div style={{width:72,display:"flex",flexDirection:"column",gap:2}}>
          <div style={{fontSize:10,color:"#aaa89e",textAlign:"right"}}>{pctDone}% done</div>
          <div style={{height:3,background:"#f0ede8",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${pctDone}%`,height:"100%",background:pctDone===100?"#63991f":"#185FA5",borderRadius:2}}/>
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          <Pill l={`${assigned}/${p.tasks.length} staffed`} c={assigned===p.tasks.length?"#3B6D11":"#854F0B"} b={assigned===p.tasks.length?"#EAF3DE":"#FAEEDA"}/>
          {anyIssue&&<Pill l="RDB!" c="#A32D2D" b="#FCEBEB"/>}
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:14,fontWeight:600}}>{fmtR(p.milestoneRate)}/{p.uom}</div>
          {fRev!=null&&<div style={{fontSize:11,color:"#3B6D11",fontWeight:500}}>${Math.round(fRev).toLocaleString()} fcst</div>}
        </div>
        <button onClick={e=>{e.stopPropagation();if(window.confirm(`Remove milestone "${p.milestone}"?`))deleteProj(p.id);}}
          title="Remove this milestone line"
          style={{flexShrink:0,width:24,height:24,borderRadius:5,border:"0.5px solid #f7c1c1",background:"#fcebeb",
            color:"#A32D2D",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            lineHeight:1,padding:0,fontWeight:700}}>x</button>
      </div>

      {isOpen&&(
        <div style={{borderTop:"0.5px solid #e8e5de",padding:"14px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:14}}>
            <MiniStat l="Master rate" v={fmtR(p.masterRate)}/>
            <MiniStat l="Milestone %" v={`${Math.round(p.milestonePct*100)}%`}/>
            <div>
              <div style={{fontSize:10,color:"#aaa89e",textTransform:"uppercase",marginBottom:3}}>Unit forecast <YD/></div>
              <input type="number" value={p.uForecast??""} onChange={e=>updProj(p.id,"uForecast",e.target.value===""?null:parseFloat(e.target.value))}
                className="yi" placeholder="-" style={{width:"100%",height:28,padding:"0 8px",border:"0.5px solid #e8c84a",borderRadius:6,fontSize:13,background:"#fffbe6"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"#aaa89e",textTransform:"uppercase",marginBottom:3}}>Final units <YD/></div>
              <input type="number" value={p.finalUnits??""} onChange={e=>updProj(p.id,"finalUnits",e.target.value===""?null:parseFloat(e.target.value))}
                className="yi" placeholder="-" style={{width:"100%",height:28,padding:"0 8px",border:"0.5px solid #e8c84a",borderRadius:6,fontSize:13,background:"#fffbe6"}}/>
            </div>
            <MiniStat l="Forecast rev" v={fRev!=null?"$"+Math.round(fRev).toLocaleString():"-"} c="#3B6D11"/>
            <MiniStat l="W2 target" v={`${Math.round(p.w2ProdTarget*100)}%`}/>
            <MiniStat l="Sub target" v={`${Math.round(p.subProdTarget*100)}%`}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"26px 1fr 52px 170px 115px 78px 90px 145px 105px",gap:6,
            padding:"3px 8px",fontSize:10,color:"#aaa89e",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>
            <span/><span>Task (color = resource type) / RDB</span><span>Rev%</span><span>Assignee <YD/></span>
            <span>Status <YD/></span><span>ECD <YD/></span><span>Actual <YD/></span><span>Load fcst -> RDB hrs <YD/></span><span>Rates</span>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {p.tasks.map((t,i)=><TaskRow key={t.id} t={t} i={i} pid={p.id} p={p} updTask={updTask} roster={roster}/>)}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10,paddingTop:8,borderTop:"0.5px solid #eee"}}>
            {Object.entries(TASK_TYPE_STYLE).map(([type,s])=>(
              <span key={type} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#888780"}}>
                <span style={{width:8,height:8,borderRadius:2,background:s.dot,display:"inline-block"}}/>
                {s.label}
              </span>
            ))}
            <span style={{fontSize:10,color:"#aaa89e",marginLeft:4}}>-- assignee pool filtered by task type</span>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({t, i, pid, p, updTask, roster}) {
  const taskType = getTaskType(t.name);
  const typeStyle = TASK_TYPE_STYLE[taskType] || TASK_TYPE_STYLE.production;
  const eligible=useMemo(()=>getEligible(t.name,roster),[t.name,roster]);
  const flag=rdbFlag(t.loadForecast,t.rdbHours);
  const sc=STATUS_CFG[t.status]||STATUS_CFG["Not Started"];

  const ecdDelta = useMemo(() => {
    if (!t.ecd || !t.actualDate) return null;
    const ecd = new Date(t.ecd); ecd.setHours(0,0,0,0);
    const act = new Date(t.actualDate); act.setHours(0,0,0,0);
    const days = Math.round((act - ecd) / 86400000);
    return days;
  }, [t.ecd, t.actualDate]);

  return (
    <div className="hr" style={{display:"grid",gridTemplateColumns:"26px 1fr 52px 170px 115px 78px 90px 145px 105px",
      gap:6,padding:"7px 8px",borderRadius:7,background:"#f8f7f4",alignItems:"start"}}>
      <div style={{width:22,height:22,borderRadius:"50%",background:"#e8e5de",display:"flex",alignItems:"center",
        justifyContent:"center",fontSize:10,fontWeight:600,color:"#555",fontFamily:"'DM Mono',monospace"}}>T{i+1}</div>

      <div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
          <div style={{fontSize:13,fontWeight:500}}>{t.name}</div>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:typeStyle.bg,color:typeStyle.color,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",flexShrink:0}}>{typeStyle.label}</span>
        </div>
        <div style={{fontSize:10,color:"#aaa89e",marginBottom:1}}>{t.rdbtask}</div>
        <div style={{fontSize:10,color:"#888780"}}>
          {t.uhr>0&&<span>U/Hr: <strong>{fmtN(t.uhr,1)}</strong></span>}
          {t.loadForecast!=null&&<span style={{marginLeft:8}}>Load: <strong>{fmtN(t.loadForecast,2)}h</strong></span>}
        </div>
      </div>

      <div style={{fontSize:12,color:"#888780",textAlign:"center",paddingTop:4}}>{Math.round(t.revPct*100)}%</div>

      <div style={{background:"#fffbe6",border:"0.5px solid #e8c84a",borderRadius:7,padding:"3px 7px",display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:t.resource?typeStyle.bg:"#f0ede8",
          color:t.resource?typeStyle.color:"#aaa89e",fontSize:9,fontWeight:600,display:"flex",alignItems:"center",
          justifyContent:"center",flexShrink:0,border:t.resource?"none":"1px dashed #ccc"}}>
          {t.resource?initials(t.resource):"?"}
        </div>
        <select value={t.resource||""} onChange={e=>updTask(pid,t.id,"resource",e.target.value||null)}
          style={{flex:1,border:"none",background:"transparent",fontSize:11,color:t.resource?"#1a1a18":"#aaa89e",outline:"none",appearance:"none",minWidth:0}}>
          <option value="">Unassigned -- {typeStyle.label}</option>
          {eligible.map(r=><option key={r.id} value={r.name}>{r.name} (${r.rate.toFixed(0)}/hr)</option>)}
        </select>
      </div>

      <select value={t.status} onChange={e=>updTask(pid,t.id,"status",e.target.value)}
        style={{border:`1px solid ${sc.color}50`,borderRadius:7,padding:"5px 7px",background:sc.bg,
          color:sc.color,fontSize:11,fontWeight:500,appearance:"none",outline:"none",cursor:"pointer"}}>
        {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
      </select>

      <input type="date" value={t.ecd||""} onChange={e=>updTask(pid,t.id,"ecd",e.target.value||null)}
        className="yi" style={{height:30,padding:"0 5px",border:"0.5px solid #e8c84a",borderRadius:6,
          background:"#fffbe6",fontSize:11,width:"100%",color:"#1a1a18"}}/>

      <div style={{display:"flex",flexDirection:"column",gap:3}}>
        <input type="date" value={t.actualDate||""} onChange={e=>updTask(pid,t.id,"actualDate",e.target.value||null)}
          className="yi" style={{height:26,padding:"0 4px",border:"0.5px solid #e8c84a",borderRadius:5,
            background:"#fffbe6",fontSize:10,width:"100%",color:"#1a1a18"}}/>
        {ecdDelta!==null && (
          <div style={{display:"flex",alignItems:"center",gap:3}}>
            <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",fontWeight:600,
              color:ecdDelta===0?"#3B6D11":ecdDelta<0?"#3B6D11":"#A32D2D"}}>
              {ecdDelta===0?"On time":ecdDelta<0?`${Math.abs(ecdDelta)}d early`:`${ecdDelta}d late`}
            </span>
          </div>
        )}
        {!t.actualDate && t.ecd && (
          <div style={{fontSize:9,color:"#aaa89e"}}>no actual</div>
        )}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:3}}>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <span style={{fontSize:10,color:"#aaa89e",width:34,flexShrink:0}}>Plan:</span>
          <span style={{fontSize:11,fontWeight:500,color:"#185FA5",minWidth:40}}>{t.loadForecast!=null?fmtN(t.loadForecast,2)+"h":"-"}</span>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <span style={{fontSize:10,color:"#aaa89e",width:34,flexShrink:0}}>RDB:</span>
          <input type="number" value={t.rdbHours??""} onChange={e=>updTask(pid,t.id,"rdbHours",e.target.value===""?null:parseFloat(e.target.value))}
            placeholder="hrs" className="yi" style={{flex:1,height:24,padding:"0 5px",border:"0.5px solid #e8c84a",
              borderRadius:5,background:"#fffbe6",fontSize:11,width:60}}/>
        </div>
        {flag&&<div style={{display:"flex",alignItems:"center",gap:3}}>
          <Pill l={flag.label} c={flag.color} b={flag.bg} sz={10}/>
          <span style={{fontSize:10,color:flag.color,fontFamily:"'DM Mono',monospace"}}>{flag.delta>0?"+":""}{flag.delta.toFixed(1)}h</span>
        </div>}
      </div>

      <div style={{fontSize:11,color:"#888780",textAlign:"right"}}>
        <div style={{fontWeight:500,color:"#1a1a18"}}>{fmtR(t.subRate)}<span style={{fontSize:9}}> sub</span></div>
        <div>{fmtR(t.w2Pay)}<span style={{fontSize:9}}> w2</span></div>
        <div style={{marginTop:2,fontSize:10}}>${t.eeRate?.toFixed(2)||"-"}/hr ee</div>
      </div>
    </div>
  );
}

// Count weekday working hours in a date range
function countWorkdays(start, end) {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day > 0 && day < 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

function ResView({projects, roster, updTask}) {
  const [period, setPeriod] = useState("weekly");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [viewMode, setViewMode] = useState("individual");
  const [selectedSup, setSelectedSup] = useState("");
  const [selectedRes, setSelectedRes] = useState(null);
  const [search, setSearch] = useState("");

  const today = useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d;},[]);

  const periodBounds = useMemo(()=>{
    // Custom date range
    if (period === "custom" && customStart && customEnd) {
      const start = new Date(customStart); start.setHours(0,0,0,0);
      const end   = new Date(customEnd);   end.setHours(0,0,0,0);
      if (start <= end) {
        const workdays = countWorkdays(start, end);
        const label = start.toLocaleDateString("en-US",{month:"short",day:"numeric"}) +
          " - " + end.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
        return {start, end, availHours: workdays * 8, label};
      }
    }
    const d = new Date(today);
    if (period==="weekly") {
      const dow = d.getDay(); const mon = new Date(d); mon.setDate(d.getDate()-(dow===0?6:dow-1));
      const sun = new Date(mon); sun.setDate(mon.getDate()+6);
      return {start:mon, end:sun, availHours:40, label:"This week"};
    }
    if (period==="monthly") {
      const start = new Date(d.getFullYear(),d.getMonth(),1);
      const end   = new Date(d.getFullYear(),d.getMonth()+1,0);
      return {start, end, availHours:countWorkdays(start,end)*8, label:"This month"};
    }
    if (period==="quarterly") {
      const q = Math.floor(d.getMonth()/3);
      const start = new Date(d.getFullYear(),q*3,1);
      const end   = new Date(d.getFullYear(),q*3+3,0);
      return {start, end, availHours:countWorkdays(start,end)*8, label:"Q"+(q+1)+" "+d.getFullYear()};
    }
    // YTD
    const start = new Date(d.getFullYear(),0,1);
    return {start, end:d, availHours:countWorkdays(start,d)*8, label:"YTD "+d.getFullYear()};
  },[period, customStart, customEnd, today]);

  const resourceData = useMemo(()=>{
    const map = {};
    projects.forEach(p => {
      const units = p.finalUnits ?? p.uForecast ?? null;
      const totalRev = units ? p.milestoneRate * units : 0;
      p.tasks.forEach((t, ti) => {
        const k = t.resource || "__unassigned__";
        if (!map[k]) map[k] = { tasks:[], rdbHoursByDate:{} };
        const inPeriod = t.actualDate && (()=>{
          const d = new Date(t.actualDate); d.setHours(0,0,0,0);
          return d >= periodBounds.start && d <= periodBounds.end;
        })();
        let productivity = null;
        if (units && t.uhr > 0 && t.rdbHours > 0 && t.status === "Complete") {
          const budgetedHours = units / t.uhr;
          productivity = Math.min(100, Math.round(budgetedHours / t.rdbHours * 100));
        }
        // Any production task can receive a quality score
        const taskType = getTaskType(t.name);
        const canHaveFPY = taskType === "production" || taskType === "fielding" || taskType === "permitting";
        map[k].tasks.push({
          id: t.id, pid: p.id, name: t.name, milestone: p.milestone,
          customer: p.customer, project: p.project,
          status: t.status, actualDate: t.actualDate, ecd: t.ecd,
          rdbHours: t.rdbHours, loadForecast: t.loadForecast,
          uhr: t.uhr, revPct: t.revPct, units,
          taskRev: totalRev * t.revPct,
          productivity, inPeriod,
          canHaveFPY,
          fpyScore: t.fpyScore ?? null,
          taskType,
        });
        if (t.rdbHours && t.actualDate) {
          const dd = t.actualDate.slice(0,10);
          map[k].rdbHoursByDate[dd] = (map[k].rdbHoursByDate[dd]||0) + t.rdbHours;
        }
      });
    });
    return map;
  },[projects, periodBounds]);

  const resourceScores = useMemo(()=>{
    const scores = {};
    Object.entries(resourceData).forEach(([name, data]) => {
      if (name === "__unassigned__") return;
      const periodTasks = data.tasks.filter(t => t.inPeriod);
      // Productivity: only average tasks that are Complete AND have a calculable score (blank = excluded)
      const prodTasks = periodTasks.filter(t => t.productivity !== null && t.status === "Complete");
      const avgProd = prodTasks.length ? Math.round(prodTasks.reduce((a,t)=>a+t.productivity,0)/prodTasks.length) : null;
      const periodRdbHours = Object.entries(data.rdbHoursByDate).reduce((sum,[dd,hrs])=>{
        const d = new Date(dd); d.setHours(0,0,0,0);
        return (d>=periodBounds.start && d<=periodBounds.end) ? sum+hrs : sum;
      }, 0);
      const util = periodBounds.availHours > 0
        ? Math.min(100, Math.round(periodRdbHours / periodBounds.availHours * 100)) : null;
      // FPY: only average tasks that have a score entered -- blanks are excluded entirely, not treated as zero
      const fpyTasks = data.tasks.filter(t => t.fpyScore !== null && t.inPeriod);
      const avgFPY = fpyTasks.length ? Math.round(fpyTasks.reduce((a,t)=>a+t.fpyScore,0)/fpyTasks.length) : null;
      let puf = null;
      const hasSome = avgProd!==null || util!==null || avgFPY!==null;
      if (hasSome) {
        let score=0, weight=0;
        if(avgProd!==null){score+=avgProd*0.45;weight+=0.45;}
        if(util!==null){score+=util*0.10;weight+=0.10;}
        if(avgFPY!==null){score+=avgFPY*0.45;weight+=0.45;}
        puf = weight>0 ? Math.round(score/weight) : null;
      }
      scores[name] = {
        avgProd, util, avgFPY, puf,
        periodRdbHours: Math.round(periodRdbHours*10)/10,
        availHours: periodBounds.availHours,
        periodTasks: periodTasks.length,
        totalTasks: data.tasks.length,
        completedTasks: data.tasks.filter(t=>t.status==="Complete").length,
      };
    });
    return scores;
  },[resourceData, periodBounds]);

  const pufGrade = (score) => {
    if (score===null) return {grade:"-",color:"#aaa89e",bg:"#f8f7f4"};
    if (score>=90) return {grade:"A",color:"#3B6D11",bg:"#EAF3DE"};
    if (score>=75) return {grade:"B",color:"#185FA5",bg:"#E6F1FB"};
    if (score>=60) return {grade:"C",color:"#854F0B",bg:"#FAEEDA"};
    return {grade:"D",color:"#A32D2D",bg:"#FCEBEB"};
  };

  const ScoreBadge = ({label, val, color, bg}) => (
    <div style={{flex:1,textAlign:"center",background:bg,borderRadius:6,padding:"5px 4px"}}>
      <div style={{fontSize:9,color,textTransform:"uppercase",letterSpacing:"0.04em",fontWeight:600,marginBottom:2}}>{label}</div>
      <div style={{fontSize:16,fontWeight:700,color}}>{val!==null?val+"%":"-"}</div>
    </div>
  );

  const allNames = Object.keys(resourceData).filter(k=>k!=="__unassigned__").sort((a,b)=>a.localeCompare(b));

  const allSupervisors = useMemo(()=>{
    const s = new Set();
    allNames.forEach(name => {
      const emp = roster.find(r=>r.name===name);
      if (emp?.supervisor) s.add(emp.supervisor);
    });
    return [...s].sort((a,b)=>a.localeCompare(b));
  },[allNames, roster]);

  const supervisorGroups = useMemo(()=>{
    const g = {};
    allNames.forEach(name => {
      const emp = roster.find(r=>r.name===name);
      const sup = emp?.supervisor || "No Supervisor";
      if (!g[sup]) g[sup] = [];
      g[sup].push(name);
    });
    return g;
  },[allNames, roster]);

  const filteredNames = allNames.filter(name => {
    const emp = roster.find(r=>r.name===name);
    if (workerFilter==="employee" && emp?.isSubcontractor) return false;
    if (workerFilter==="subcontractor" && !emp?.isSubcontractor) return false;
    if (selectedSup && emp?.supervisor !== selectedSup) return false;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredSupervisors = useMemo(()=>{
    if (viewMode !== "supervisor") return [];
    return Object.keys(supervisorGroups)
      .filter(sup => selectedSup ? sup === selectedSup : true)
      .filter(sup => {
        if (!search) return true;
        return supervisorGroups[sup].some(n=>n.toLowerCase().includes(search.toLowerCase()))
          || sup.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a,b)=>a.localeCompare(b));
  },[viewMode, supervisorGroups, selectedSup, search]);

  // Render a single resource card
  const renderCard = (name) => {
    const emp = roster.find(r=>r.name===name);
    const scores = resourceScores[name]||{};
    const data = resourceData[name]||{tasks:[]};
    const grade = pufGrade(scores.puf);
    const isSub = emp?.isSubcontractor;
    const statusCounts = data.tasks.reduce((a,t)=>{a[t.status]=(a[t.status]||0)+1;return a;},{});
    return (
      <div key={name} style={{background:"#fff",border:"0.5px solid "+(isSub?"#e8c84a":"#dddbd4"),
        borderRadius:12,overflow:"hidden",cursor:"pointer"}}
        onClick={()=>setSelectedRes(selectedRes===name?null:name)}>
        <div style={{padding:"12px 14px",borderBottom:"0.5px solid #f0ede8"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,display:"flex",
              alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,
              background:isSub?"#FAEEDA":"#E6F1FB",color:isSub?"#854F0B":"#185FA5",
              border:isSub?"1px solid #e8c84a":"none"}}>
              {isSub?"S":initials(name)}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
              <div style={{fontSize:11,color:"#aaa89e"}}>{emp?.title||"Unassigned"}{isSub&&<span style={{marginLeft:5,fontSize:10,padding:"1px 5px",borderRadius:3,background:"#FAEEDA",color:"#854F0B",fontWeight:600}}>SUB</span>}</div>
            </div>
            <div style={{width:40,height:40,borderRadius:8,background:grade.bg,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <div style={{fontSize:18,fontWeight:800,color:grade.color,lineHeight:1}}>{grade.grade}</div>
              <div style={{fontSize:8,color:grade.color,fontWeight:600}}>PUF</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:8}}>
            <ScoreBadge label="P" val={scores.avgProd??null} color={pufGrade(scores.avgProd).color} bg={pufGrade(scores.avgProd).bg}/>
            <ScoreBadge label="U" val={scores.util??null} color={pufGrade(scores.util).color} bg={pufGrade(scores.util).bg}/>
            <ScoreBadge label="F" val={scores.avgFPY??null} color={pufGrade(scores.avgFPY).color} bg={pufGrade(scores.avgFPY).bg}/>
            <div style={{flex:1.2,textAlign:"center",background:grade.bg,borderRadius:6,padding:"5px 4px",border:"1px solid "+grade.color+"30"}}>
              <div style={{fontSize:9,color:grade.color,textTransform:"uppercase",letterSpacing:"0.04em",fontWeight:600,marginBottom:2}}>PUF</div>
              <div style={{fontSize:16,fontWeight:800,color:grade.color}}>{scores.puf!==null?scores.puf+"%":"-"}</div>
            </div>
          </div>
          <div style={{marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#888780",marginBottom:3}}>
              <span>Utilization ({periodBounds.label})</span>
              <span style={{fontWeight:500,color:"#1a1a18"}}>{scores.periodRdbHours||0}h / {periodBounds.availHours}h</span>
            </div>
            <div style={{height:4,background:"#f0ede8",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:Math.min(100,scores.util||0)+"%",height:"100%",borderRadius:2,
                background:(scores.util||0)>85?"#E24B4A":(scores.util||0)>60?"#BA7517":"#185FA5"}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {Object.entries(statusCounts).map(([s,n])=>{
              const cfg=STATUS_CFG[s]||{color:"#888780",bg:"#F1EFE8"};
              return <Pill key={s} l={n+" "+s} c={cfg.color} b={cfg.bg} sz={10}/>;
            })}
            <span style={{fontSize:10,color:"#aaa89e",marginLeft:"auto"}}>{data.tasks.length} tasks total</span>
          </div>
        </div>
        {selectedRes===name && (
          <div style={{padding:"10px 14px",background:"#f8f7f4"}}>
            <div style={{fontSize:11,fontWeight:500,color:"#555",marginBottom:8,textTransform:"uppercase",
              letterSpacing:"0.05em"}}>Task Detail -- {periodBounds.label}</div>
            {data.tasks.length===0&&<div style={{fontSize:12,color:"#aaa89e"}}>No tasks assigned.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {data.tasks.map((t,i)=>{
                const ts=TASK_TYPE_STYLE[t.taskType]||TASK_TYPE_STYLE.production;
                return (
                  <div key={i} style={{background:"#fff",borderRadius:8,padding:"8px 10px",
                    border:"0.5px solid #e8e5de",opacity:t.inPeriod?1:0.6}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:ts.bg,
                        color:ts.color,fontWeight:600,textTransform:"uppercase"}}>{ts.label}</span>
                      <span style={{fontSize:12,fontWeight:500,flex:1}}>{t.name}</span>
                      {t.inPeriod&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,
                        background:"#E6F1FB",color:"#185FA5",fontWeight:600}}>IN PERIOD</span>}
                    </div>
                    <div style={{fontSize:11,color:"#888780",marginBottom:4}}>
                      {t.milestone.length>30?t.milestone.slice(0,30)+"...":t.milestone}
                      {t.project&&<span style={{marginLeft:5,fontFamily:"'DM Mono',monospace",fontSize:10}}>- {t.project}</span>}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                      <div style={{background:"#f8f7f4",borderRadius:5,padding:"4px 6px"}}>
                        <div style={{fontSize:9,color:"#aaa89e",marginBottom:1}}>Productivity</div>
                        <div style={{fontSize:13,fontWeight:600,color:t.productivity!==null?pufGrade(t.productivity).color:"#aaa89e"}}>
                          {t.productivity!==null?t.productivity+"%":"-"}
                        </div>
                      </div>
                      <div style={{background:"#f8f7f4",borderRadius:5,padding:"4px 6px"}}>
                        <div style={{fontSize:9,color:"#aaa89e",marginBottom:1}}>RDB hrs</div>
                        <div style={{fontSize:13,fontWeight:600,color:"#1a1a18"}}>{t.rdbHours!=null?t.rdbHours:"-"}</div>
                      </div>
                      <div style={{background:t.canHaveFPY?"#fffbe6":"#f8f7f4",borderRadius:5,padding:"4px 6px",
                        border:t.canHaveFPY?"0.5px solid #e8c84a":"none",gridColumn:t.canHaveFPY?"span 2":"span 1"}}>
                        <div style={{fontSize:9,color:t.canHaveFPY?"#854F0B":"#aaa89e",marginBottom:1,fontWeight:t.canHaveFPY?600:400}}>
                          {t.canHaveFPY?"Quality Score (blank = not counted)":"QC/PM (no quality score)"}
                        </div>
                        {t.canHaveFPY ? (
                          <div style={{display:"flex",alignItems:"center",gap:4}} onClick={e=>e.stopPropagation()}>
                            <input type="number" min="0" max="100"
                              value={t.fpyScore??""} placeholder="leave blank if N/A"
                              onChange={e=>{
                                const v=e.target.value===""?null:Math.min(100,Math.max(0,parseFloat(e.target.value)));
                                updTask(t.pid,t.id,"fpyScore",v);
                              }}
                              style={{width:80,height:24,padding:"0 6px",border:"0.5px solid #e8c84a",
                                borderRadius:5,background:"#fffbe6",fontSize:12,fontWeight:600,outline:"none"}}/>
                            <span style={{fontSize:11,color:"#888780"}}>%</span>
                            {t.fpyScore!==null
                              ? <span style={{fontSize:12,fontWeight:700,color:pufGrade(t.fpyScore).color}}>{t.fpyScore}%</span>
                              : <span style={{fontSize:10,color:"#aaa89e",fontStyle:"italic"}}>not counted</span>
                            }
                          </div>
                        ):(
                          <div style={{fontSize:11,color:"#aaa89e",fontStyle:"italic"}}>n/a</div>
                        )}
                      </div>
                    </div>
                    {(t.ecd||t.actualDate)&&(
                      <div style={{marginTop:5,fontSize:10,color:"#888780",display:"flex",gap:12}}>
                        {t.ecd&&<span>ECD: <strong>{t.ecd}</strong></span>}
                        {t.actualDate&&<span>Actual: <strong style={{color:"#3B6D11"}}>{t.actualDate}</strong></span>}
                        {t.ecd&&t.actualDate&&(()=>{
                          const delta=Math.round((new Date(t.actualDate)-new Date(t.ecd))/86400000);
                          return <span style={{fontWeight:600,color:delta<=0?"#3B6D11":"#A32D2D"}}>
                            {delta===0?"On time":delta<0?Math.abs(delta)+"d early":delta+"d late"}
                          </span>;
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resource or supervisor..."
          style={{height:32,padding:"0 10px",border:"0.5px solid #ccc9c0",borderRadius:7,fontSize:13,
            background:"#fff",color:"#1a1a18",outline:"none",minWidth:200}}/>
        <div style={{flex:1}}/>
        <div style={{fontSize:12,color:"#888780"}}>View:</div>
        {[["individual","By Individual"],["supervisor","By Supervisor"]].map(([v,l])=>(
          <button key={v} onClick={()=>{setViewMode(v);setSelectedSup("");}} style={{padding:"4px 12px",fontSize:12,border:"1px solid",
            borderColor:viewMode===v?"#185FA5":"#ccc9c0",borderRadius:6,
            background:viewMode===v?"#E6F1FB":"#fff",color:viewMode===v?"#185FA5":"#555",cursor:"pointer",
            fontWeight:viewMode===v?500:400}}>{l}</button>
        ))}
        <div style={{fontSize:12,color:"#888780",marginLeft:4}}>Show:</div>
        {[["all","All"],["employee","Employees"],["subcontractor","Subcontractors"]].map(([v,l])=>(
          <button key={v} onClick={()=>setWorkerFilter(v)} style={{padding:"4px 12px",fontSize:12,border:"1px solid",
            borderColor:workerFilter===v?"#185FA5":"#ccc9c0",borderRadius:6,
            background:workerFilter===v?"#E6F1FB":"#fff",color:workerFilter===v?"#185FA5":"#555",cursor:"pointer",
            fontWeight:workerFilter===v?500:400}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:12,color:"#888780"}}>Supervisor:</div>
        <select value={selectedSup} onChange={e=>setSelectedSup(e.target.value)}
          style={{height:30,padding:"0 8px",border:"0.5px solid #ccc9c0",borderRadius:6,fontSize:12,
            background:"#fff",color:selectedSup?"#1a1a18":"#888780",outline:"none",cursor:"pointer",minWidth:180}}>
          <option value="">All supervisors</option>
          {allSupervisors.map(s=>(
            <option key={s} value={s}>{s} ({(supervisorGroups[s]||[]).length})</option>
          ))}
        </select>
        <div style={{flex:1}}/>
        <div style={{fontSize:12,color:"#888780"}}>Period:</div>
        {[["weekly","Weekly"],["monthly","Monthly"],["quarterly","Quarterly"],["ytd","YTD"],["custom","Custom"]].map(([v,l])=>(
          <button key={v} onClick={()=>setPeriod(v)} style={{padding:"4px 12px",fontSize:12,border:"1px solid",
            borderColor:period===v?"#185FA5":"#ccc9c0",borderRadius:6,
            background:period===v?"#E6F1FB":"#fff",color:period===v?"#185FA5":"#555",cursor:"pointer",
            fontWeight:period===v?500:400}}>{l}</button>
        ))}
      </div>
      {period==="custom"&&(
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
          <div style={{fontSize:12,color:"#888780"}}>From:</div>
          <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)}
            style={{height:30,padding:"0 8px",border:"0.5px solid #ccc9c0",borderRadius:6,fontSize:12,outline:"none"}}/>
          <div style={{fontSize:12,color:"#888780"}}>To:</div>
          <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)}
            style={{height:30,padding:"0 8px",border:"0.5px solid #ccc9c0",borderRadius:6,fontSize:12,outline:"none"}}/>
          {customStart&&customEnd&&new Date(customStart)<=new Date(customEnd)&&(
            <span style={{fontSize:11,color:"#3B6D11",background:"#EAF3DE",padding:"2px 8px",borderRadius:4}}>
              {periodBounds.availHours}h available
            </span>
          )}
        </div>
      )}
      <div style={{fontSize:12,color:"#888780",marginBottom:12,display:"flex",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <span>Showing PUF scores for: <strong style={{color:"#1a1a18"}}>{periodBounds.label}</strong></span>
        <span>- Available hours: <strong>{periodBounds.availHours}h</strong></span>
        {selectedSup&&<span style={{padding:"2px 8px",borderRadius:4,background:"#E6F1FB",color:"#185FA5",fontWeight:500,fontSize:11}}>
          Supervisor: {selectedSup}
        </span>}
        <span style={{fontSize:11,color:"#aaa89e"}}>P=Productivity (45%) - U=Utilization (10%) - F=First-Pass Yield (45%)</span>
      </div>

      {viewMode==="supervisor" ? (
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {filteredSupervisors.length===0&&(
            <div style={{textAlign:"center",padding:"2rem",color:"#aaa89e",fontSize:13}}>No supervisors match your filters.</div>
          )}
          {filteredSupervisors.map(sup => {
            const teamNames = (supervisorGroups[sup]||[]).filter(name => {
              const emp = roster.find(r=>r.name===name);
              if (workerFilter==="employee" && emp?.isSubcontractor) return false;
              if (workerFilter==="subcontractor" && !emp?.isSubcontractor) return false;
              if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
              return true;
            });
            if (teamNames.length === 0) return null;
            const teamScores = teamNames.map(n=>resourceScores[n]).filter(Boolean);
            const pufs = teamScores.map(s=>s.puf).filter(v=>v!==null);
            const avgPuf = pufs.length ? Math.round(pufs.reduce((a,b)=>a+b,0)/pufs.length) : null;
            const teamGrade = pufGrade(avgPuf);
            const supInRoster = roster.find(r=>r.name===sup);
            return (
              <div key={sup}>
                <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                  background:"#f8f7f4",borderRadius:10,marginBottom:10,border:"0.5px solid #dddbd4"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"#1a1a18",
                    color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",
                    justifyContent:"center",flexShrink:0}}>{initials(sup)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1a1a18"}}>{sup}</div>
                    <div style={{fontSize:11,color:"#888780"}}>{supInRoster?.title||"Supervisor"} - {teamNames.length} direct report{teamNames.length!==1?"s":""}</div>
                  </div>
                  {avgPuf!==null&&(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10,color:"#888780",marginBottom:2}}>Team avg PUF</div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:18,fontWeight:800,color:teamGrade.color}}>{avgPuf}%</span>
                        <span style={{fontSize:13,fontWeight:700,padding:"2px 7px",borderRadius:5,
                          background:teamGrade.bg,color:teamGrade.color}}>{teamGrade.grade}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12,paddingLeft:12}}>
                  {teamNames.map(name => renderCard(name))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
          {filteredNames.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"2rem",color:"#aaa89e",fontSize:13}}>
              No resources match your filters.
            </div>
          )}
          {filteredNames.map(name => renderCard(name))}
        </div>
      )}

      {resourceData["__unassigned__"] && (
        <div style={{marginTop:16,background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,padding:14}}>
          <div style={{fontSize:12,fontWeight:500,color:"#888780",marginBottom:8}}>
            Unassigned tasks ({resourceData["__unassigned__"].tasks.length})
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {resourceData["__unassigned__"].tasks.slice(0,8).map((t,i)=>(
              <div key={i} style={{fontSize:11,padding:"3px 8px",background:"#f8f7f4",borderRadius:5,color:"#888780"}}>
                <strong style={{color:"#1a1a18"}}>{t.name}</strong> -- {t.milestone.length>20?t.milestone.slice(0,20)+"...":t.milestone}
              </div>
            ))}
            {resourceData["__unassigned__"].tasks.length>8&&(
              <div style={{fontSize:11,color:"#aaa89e",padding:"3px 6px"}}>
                +{resourceData["__unassigned__"].tasks.length-8} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RDBView({projects, updTask}) {
  const allTasks=useMemo(()=>{
    const rows=[];
    projects.forEach(p=>p.tasks.forEach(t=>{
      rows.push({...t,pid:p.id,msName:p.milestone,cust:p.customer,proj:p.project,flag:rdbFlag(t.loadForecast,t.rdbHours)});
    }));
    return rows;
  },[projects]);

  const issues=allTasks.filter(t=>t.flag&&t.flag.label!=="On Track");

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          {l:"Tasks w/ forecast",v:allTasks.filter(t=>t.loadForecast!=null).length,s:"load calculated"},
          {l:"On Track",v:allTasks.filter(t=>t.flag?.label==="On Track").length,c:"#3B6D11",b:"#EAF3DE"},
          {l:"Over Budget",v:issues.filter(t=>t.flag?.label==="Over").length,c:"#A32D2D",b:"#FCEBEB"},
          {l:"Under Budget",v:issues.filter(t=>t.flag?.label==="Under").length,c:"#854F0B",b:"#FAEEDA"},
        ].map(s=>(
          <div key={s.l} style={{background:s.b||"#fff",border:"0.5px solid #dddbd4",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:s.c||"#888780",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:600,color:s.c||"#1a1a18"}}>{s.v}</div>
            {s.s&&<div style={{fontSize:11,color:"#aaa89e",marginTop:2}}>{s.s}</div>}
          </div>
        ))}
      </div>
      <div style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"#f8f7f4"}}>
            {["Project","Task / RDB","Assignee","Status","Load forecast","RDB actual hrs","Delta","Flag"].map(h=>(
              <th key={h} style={{padding:"9px 12px",textAlign:"left",color:"#888780",fontWeight:500,borderBottom:"1px solid #eee",whiteSpace:"nowrap",fontSize:11}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{allTasks.map(t=>(
            <tr key={t.id} className="hr" style={{borderBottom:"0.5px solid #f0ede8"}}>
              <td style={{padding:"8px 12px"}}>
                <div style={{fontWeight:500}}>{t.msName.length>22?t.msName.slice(0,22)+"...":t.msName}</div>
                <div style={{fontSize:10,color:"#aaa89e"}}>{t.cust}{t.proj&&` * ${t.proj}`}</div>
              </td>
              <td style={{padding:"8px 12px"}}>
                <div style={{fontWeight:500}}>{t.name}</div>
                <div style={{fontSize:10,color:"#aaa89e"}}>{t.rdbtask}</div>
              </td>
              <td style={{padding:"8px 12px",color:t.resource?"#1a1a18":"#ccc"}}>{t.resource||"Unassigned"}</td>
              <td style={{padding:"8px 12px"}}>{t.status&&<Pill l={t.status} c={STATUS_CFG[t.status]?.color||"#888"} b={STATUS_CFG[t.status]?.bg||"#eee"} sz={11}/>}</td>
              <td style={{padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:12,color:"#185FA5"}}>
                {t.loadForecast!=null?<>{fmtN(t.loadForecast,2)}h<span style={{fontSize:10,color:"#aaa89e",marginLeft:4}}>calc</span></>:<span style={{color:"#ccc"}}>--</span>}
              </td>
              <td style={{padding:"8px 12px"}}>
                <input type="number" value={t.rdbHours??""} onChange={e=>updTask(t.pid,t.id,"rdbHours",e.target.value===""?null:parseFloat(e.target.value))}
                  placeholder="-" className="yi" style={{width:70,height:26,padding:"0 7px",border:"0.5px solid #e8c84a",borderRadius:5,background:"#fffbe6",fontSize:12}}/>
              </td>
              <td style={{padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:12}}>
                {t.flag?<span style={{color:t.flag.color}}>{t.flag.delta>0?"+":""}{t.flag.delta.toFixed(1)}h</span>:<span style={{color:"#ccc"}}>--</span>}
              </td>
              <td style={{padding:"8px 12px"}}>
                {t.flag?<Pill l={t.flag.label} c={t.flag.color} b={t.flag.bg} sz={11}/>:<span style={{color:"#ccc",fontSize:11}}>no data</span>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function ActualRevenueView({ projects, updTask }) {
  const [weeksBack, setWeeksBack] = useState(12);
  const [sortField, setSortField] = useState("completedDate");
  const [sortDir, setSortDir] = useState("desc");
  const [invoiceFilter, setInvoiceFilter] = useState("all"); // "all" | "ready" | "partial"

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const isPast = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    return d <= today;
  };

  const projectSummaries = useMemo(() => {
    return projects.map(p => {
      const units = p.finalUnits ?? p.uForecast ?? null;
      const totalRev = units ? p.milestoneRate * units : 0;
      const tasks = p.tasks;
      const completedTasks = tasks.filter(t => isPast(t.actualDate));
      const allComplete = tasks.length > 0 && completedTasks.length === tasks.length;
      const anyComplete = completedTasks.length > 0;

      const latestActual = completedTasks.length > 0
        ? completedTasks.reduce((latest, t) => {
            const d = new Date(t.actualDate); d.setHours(0,0,0,0);
            return d > latest ? d : latest;
          }, new Date(0))
        : null;

      const earnedRev = completedTasks.reduce((sum, t) => sum + totalRev * t.revPct, 0);

      const actualStaffCost = completedTasks.reduce((sum, t) =>
        sum + (t.rdbHours ?? 0) * (t.eeRate ?? t.templateEeRate ?? 0), 0);
      const remainingStaffCost = tasks.filter(t => !isPast(t.actualDate)).reduce((sum, t) =>
        sum + (t.loadForecast ?? 0) * (t.eeRate ?? t.templateEeRate ?? 0), 0);
      const totalStaffCost = actualStaffCost + remainingStaffCost;
      const grossMargin = totalRev > 0 ? Math.round((totalRev - totalStaffCost) / totalRev * 100) : null;
      const earnedMargin = earnedRev > 0 ? Math.round((earnedRev - actualStaffCost) / earnedRev * 100) : null;

      const deltas = tasks
        .filter(t => t.ecd && t.actualDate)
        .map(t => {
          const ecd = new Date(t.ecd); ecd.setHours(0,0,0,0);
          const act = new Date(t.actualDate); act.setHours(0,0,0,0);
          return Math.round((act - ecd) / 86400000);
        });
      const avgDelta = deltas.length ? Math.round(deltas.reduce((a,b)=>a+b,0)/deltas.length) : null;

      return {
        ...p, totalRev, earnedRev, completedTasks: completedTasks.length,
        totalTasks: tasks.length, allComplete, anyComplete, latestActual, avgDelta,
        actualStaffCost, totalStaffCost, grossMargin, earnedMargin,
        invoiceStatus: allComplete ? "ready" : anyComplete ? "partial" : "none",
        completedDate: latestActual ? latestActual.toISOString().split("T")[0] : null,
      };
    }).filter(p => p.anyComplete || p.totalRev > 0);
  }, [projects, today]);

  const weekData = useMemo(() => {
    const monday = new Date(today);
    const day = today.getDay();
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

    const weeks = [];
    for (let i = weeksBack - 1; i >= 0; i--) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      weeks.push({
        start, end,
        label: `${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`,
        total: 0, earned: 0, byStatus: { ready: 0, partial: 0 }
      });
    }

    projects.forEach(p => {
      const units = p.finalUnits ?? p.uForecast ?? null;
      if (!units) return;
      const totalRev = p.milestoneRate * units;
      p.tasks.forEach(t => {
        if (!t.actualDate || !isPast(t.actualDate)) return;
        const act = new Date(t.actualDate); act.setHours(0,0,0,0);
        const taskRev = totalRev * t.revPct;
        const bucket = weeks.find(w => act >= w.start && act <= w.end);
        if (bucket) {
          bucket.earned += taskRev;
          const allDone = p.tasks.every(tt => isPast(tt.actualDate));
          bucket.byStatus[allDone ? "ready" : "partial"] += taskRev;
        }
      });
    });
    return weeks;
  }, [projects, weeksBack, today]);

  const maxWeekEarned = Math.max(...weekData.map(w => w.earned), 1);
  const totalEarned = weekData.reduce((a, w) => a + w.earned, 0);
  const totalReady = projectSummaries.filter(p => p.invoiceStatus === "ready").reduce((a,p)=>a+p.earnedRev,0);

  const invoiceRows = useMemo(() => {
    let rows = projectSummaries.filter(p =>
      invoiceFilter === "all" ? p.anyComplete :
      invoiceFilter === "ready" ? p.invoiceStatus === "ready" :
      p.invoiceStatus === "partial"
    );
    rows = [...rows].sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (av == null) return 1; if (bv == null) return -1;
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return rows;
  }, [projectSummaries, sortField, sortDir, invoiceFilter]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };
  const SortIcon = ({field}) => (
    <span style={{marginLeft:3,opacity:sortField===field?1:0.3,fontSize:9}}>
      {sortField===field?(sortDir==="asc"?"^":"v"):"^"}
    </span>
  );

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:500,color:"#1a1a18"}}>Actual Revenue</div>
        <div style={{flex:1}}/>
        <div style={{fontSize:12,color:"#888780"}}>Chart history:</div>
        {[8,12,16,24].map(w=>(
          <button key={w} onClick={()=>setWeeksBack(w)} style={{padding:"4px 10px",fontSize:12,border:"1px solid",
            borderColor:weeksBack===w?"#185FA5":"#ccc9c0",borderRadius:6,background:weeksBack===w?"#E6F1FB":"#fff",
            color:weeksBack===w?"#185FA5":"#555",cursor:"pointer"}}>{w}w</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:10,marginBottom:16}}>
        {[
          {l:"Ready to Invoice",v:"$"+Math.round(totalReady).toLocaleString(),s:`${projectSummaries.filter(p=>p.invoiceStatus==="ready").length} projects complete`,c:"#3B6D11",b:"#EAF3DE"},
          {l:`Earned (${weeksBack}w)`,v:"$"+Math.round(totalEarned).toLocaleString(),s:"tasks with actual dates"},
          {l:"Actual Staff Cost",v:(()=>{const c=projectSummaries.reduce((a,p)=>a+p.actualStaffCost,0);return c>0?"$"+Math.round(c).toLocaleString():"-";})(),s:"rdbHours x rate"},
          {l:"Gross Margin",v:(()=>{const ps=projectSummaries.filter(p=>p.grossMargin!=null);if(!ps.length)return"-";const avg=Math.round(ps.reduce((a,p)=>a+p.grossMargin,0)/ps.length);return avg+"%";})(),
            s:"avg across projects",c:(()=>{const ps=projectSummaries.filter(p=>p.grossMargin!=null);if(!ps.length)return"#888780";const avg=Math.round(ps.reduce((a,p)=>a+p.grossMargin,0)/ps.length);return avg>=40?"#3B6D11":avg>=20?"#854F0B":"#A32D2D";})(),
            b:(()=>{const ps=projectSummaries.filter(p=>p.grossMargin!=null);if(!ps.length)return"#fff";const avg=Math.round(ps.reduce((a,p)=>a+p.grossMargin,0)/ps.length);return avg>=40?"#EAF3DE":avg>=20?"#FAEEDA":"#FCEBEB";})()},
          {l:"Partial Complete",v:projectSummaries.filter(p=>p.invoiceStatus==="partial").length,s:"projects in progress"},
          {l:"Avg Schedule Delta",v:(()=>{const d=projectSummaries.filter(p=>p.avgDelta!=null);if(!d.length)return"-";const avg=Math.round(d.reduce((a,p)=>a+p.avgDelta,0)/d.length);return avg===0?"On time":avg>0?`+${avg}d late`:`${avg}d early`;})(),s:"ECD vs actual"},
        ].map(s=>(
          <div key={s.l} style={{background:s.b||"#fff",border:"0.5px solid #dddbd4",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:s.c||"#888780",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:20,fontWeight:600,color:s.c||"#1a1a18"}}>{s.v}</div>
            <div style={{fontSize:11,color:"#aaa89e",marginTop:2}}>{s.s}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:14,marginBottom:10}}>
        <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#555"}}>
          <span style={{width:10,height:10,borderRadius:2,background:"#3B6D11",display:"inline-block"}}/>Ready to Invoice
        </span>
        <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#555"}}>
          <span style={{width:10,height:10,borderRadius:2,background:"#B5D4F4",display:"inline-block"}}/>Partial completion
        </span>
      </div>

      <div style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,padding:"16px 16px 12px",marginBottom:16,overflowX:"auto"}}>
        <div style={{minWidth:Math.max(500, weeksBack*62)}}>
          <div style={{display:"flex",gap:0,alignItems:"flex-end",height:180,position:"relative"}}>
            {[0,25,50,75,100].map(pct=>(
              <div key={pct} style={{position:"absolute",left:0,right:0,bottom:`${pct}%`,
                borderTop:`0.5px solid ${pct===0?"#dddbd4":"#f0ede8"}`}}>
                <span style={{fontSize:9,color:"#aaa89e",background:"#fff",paddingRight:4,marginTop:-8,display:"block",whiteSpace:"nowrap"}}>
                  ${Math.round(maxWeekEarned*pct/100).toLocaleString()}
                </span>
              </div>
            ))}
            {weekData.map((w,wi)=>{
              const barH = maxWeekEarned > 0 ? (w.earned/maxWeekEarned)*100 : 0;
              const readyH = w.earned > 0 ? (w.byStatus.ready/w.earned)*100 : 0;
              const partialH = 100 - readyH;
              return (
                <div key={wi} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
                  height:"100%",justifyContent:"flex-end",padding:"0 2px",position:"relative",zIndex:1}}>
                  <div style={{width:"100%",height:`${barH}%`,display:"flex",flexDirection:"column-reverse",
                    overflow:"hidden",borderRadius:"3px 3px 0 0"}}>
                    {w.byStatus.ready>0&&<div style={{width:"100%",height:`${readyH}%`,background:"#3B6D11",minHeight:2}}
                      title={`Ready: $${Math.round(w.byStatus.ready).toLocaleString()}`}/>}
                    {w.byStatus.partial>0&&<div style={{width:"100%",height:`${partialH}%`,background:"#B5D4F4",minHeight:2}}
                      title={`Partial: $${Math.round(w.byStatus.partial).toLocaleString()}`}/>}
                  </div>
                  {w.earned>0&&<div style={{position:"absolute",bottom:`${barH}%`,fontSize:8,color:"#555",
                    textAlign:"center",whiteSpace:"nowrap",marginBottom:2}}>
                    ${Math.round(w.earned/1000).toFixed(0)}k
                  </div>}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:0,marginTop:4}}>
            {weekData.map((w,wi)=>(
              <div key={wi} style={{flex:1,textAlign:"center",fontSize:9,color:"#888780",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 1px"}}>{w.label}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
        <div style={{fontSize:13,fontWeight:500}}>Projects</div>
        {[["all","All with activity"],["ready","v Ready to Invoice"],["partial","Partial"]].map(([v,l])=>(
          <button key={v} onClick={()=>setInvoiceFilter(v)} style={{padding:"5px 14px",fontSize:12,border:"1px solid",
            borderColor:invoiceFilter===v?(v==="ready"?"#3B6D11":"#185FA5"):"#ccc9c0",borderRadius:6,
            background:invoiceFilter===v?(v==="ready"?"#EAF3DE":"#E6F1FB"):"#fff",
            color:invoiceFilter===v?(v==="ready"?"#3B6D11":"#185FA5"):"#555",cursor:"pointer",fontWeight:invoiceFilter===v?500:400}}>{l}</button>
        ))}
        <span style={{fontSize:12,color:"#888780",marginLeft:4}}>{invoiceRows.length} projects</span>
      </div>

      <div style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:"#f8f7f4"}}>
              {[
                {f:"customer",l:"Customer"},
                {f:"program",l:"Program"},
                {f:"milestone",l:"Milestone"},
                {f:"project",l:"Project ID"},
                {f:"invoiceStatus",l:"Status"},
                {f:"completedDate",l:"Completed"},
                {f:"avgDelta",l:"Sched. Delta"},
                {f:"completedTasks",l:"Tasks Done"},
                {f:"earnedRev",l:"Earned Rev"},
                {f:"totalRev",l:"Total Rev"},
                {f:"earnedMargin",l:"Margin"},
              ].map(col=>(
                <th key={col.f} onClick={()=>toggleSort(col.f)}
                  style={{padding:"9px 12px",textAlign:"left",color:"#888780",fontWeight:500,
                    borderBottom:"1px solid #eee",whiteSpace:"nowrap",fontSize:11,cursor:"pointer",userSelect:"none"}}>
                  {col.l}<SortIcon field={col.f}/>
                </th>
              ))}
            </tr></thead>
            <tbody>
              {invoiceRows.length===0&&(
                <tr><td colSpan={10} style={{padding:"2rem",textAlign:"center",color:"#aaa89e",fontSize:13}}>
                  No projects with actual completion dates yet. Add actual dates to tasks in the Projects tab.
                </td></tr>
              )}
              {invoiceRows.map(p=>(
                <tr key={p.id} className="hr" style={{borderBottom:"0.5px solid #f0ede8",
                  background:p.invoiceStatus==="ready"?"#f6fcf2":"#fff"}}>
                  <td style={{padding:"8px 12px",color:"#555"}}>{p.customer}</td>
                  <td style={{padding:"8px 12px",color:"#555",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.program}</td>
                  <td style={{padding:"8px 12px",fontWeight:500,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.milestone}</td>
                  <td style={{padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:11}}>{p.project||"-"}</td>
                  <td style={{padding:"8px 12px"}}>
                    {p.invoiceStatus==="ready"
                      ? <span style={{fontSize:11,padding:"2px 8px",borderRadius:5,background:"#EAF3DE",color:"#3B6D11",fontWeight:600}}>v Ready to Invoice</span>
                      : <span style={{fontSize:11,padding:"2px 8px",borderRadius:5,background:"#E6F1FB",color:"#185FA5",fontWeight:500}}>{p.completedTasks}/{p.totalTasks} tasks</span>
                    }
                  </td>
                  <td style={{padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,whiteSpace:"nowrap"}}>
                    {p.completedDate||"-"}
                  </td>
                  <td style={{padding:"8px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,
                    color:p.avgDelta==null?"#ccc":p.avgDelta<=0?"#3B6D11":"#A32D2D",fontWeight:p.avgDelta!=null?600:400}}>
                    {p.avgDelta==null?"-":p.avgDelta===0?"On time":p.avgDelta>0?`+${p.avgDelta}d`:`${p.avgDelta}d`}
                  </td>
                  <td style={{padding:"8px 12px",textAlign:"center"}}>
                    <span style={{fontSize:11}}>{p.completedTasks}</span>
                    <span style={{fontSize:10,color:"#aaa89e"}}> / {p.totalTasks}</span>
                  </td>
                  <td style={{padding:"8px 12px",fontWeight:700,color:"#3B6D11",textAlign:"right",whiteSpace:"nowrap"}}>
                    ${Math.round(p.earnedRev).toLocaleString()}
                  </td>
                  <td style={{padding:"8px 12px",color:"#555",textAlign:"right",whiteSpace:"nowrap"}}>
                    ${Math.round(p.totalRev).toLocaleString()}
                  </td>
                  <td style={{padding:"8px 12px",fontWeight:700,textAlign:"right",
                    color:p.earnedMargin==null?"#ccc":p.earnedMargin>=40?"#3B6D11":p.earnedMargin>=20?"#854F0B":"#A32D2D"}}>
                    {p.earnedMargin!=null?p.earnedMargin+"%":"-"}
                  </td>
                </tr>
              ))}
            </tbody>
            {invoiceRows.length > 0 && (
              <tfoot>
                <tr style={{background:"#f8f7f4",borderTop:"1px solid #dddbd4"}}>
                  <td colSpan={8} style={{padding:"9px 12px",fontSize:12,fontWeight:500,color:"#555"}}>
                    Totals -- {invoiceRows.length} projects
                  </td>
                  <td style={{padding:"9px 12px",fontWeight:700,color:"#3B6D11",textAlign:"right",whiteSpace:"nowrap"}}>
                    ${Math.round(invoiceRows.reduce((a,p)=>a+p.earnedRev,0)).toLocaleString()}
                  </td>
                  <td style={{padding:"9px 12px",fontWeight:600,color:"#555",textAlign:"right",whiteSpace:"nowrap"}}>
                    ${Math.round(invoiceRows.reduce((a,p)=>a+p.totalRev,0)).toLocaleString()}
                  </td>
                  <td style={{padding:"9px 12px",fontWeight:700,textAlign:"right",color:"#185FA5"}}>
                    {(()=>{const ps=invoiceRows.filter(p=>p.earnedMargin!=null);if(!ps.length)return"-";return Math.round(ps.reduce((a,p)=>a+p.earnedMargin,0)/ps.length)+"%";})()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {invoiceRows.filter(p=>p.invoiceStatus==="ready").length > 0 && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:10,color:"#3B6D11"}}>
            v Ready to Invoice -- Task Detail
          </div>
          <div style={{background:"#fff",border:"1px solid #b0d890",borderRadius:12,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f6fcf2"}}>
                  {["Project","Milestone","Task","Type","ECD","Actual","Delta","Rev%","Revenue","Staff Cost","Margin","Assignee"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#3B6D11",fontWeight:500,
                      borderBottom:"1px solid #b0d890",whiteSpace:"nowrap",fontSize:11}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {invoiceRows.filter(p=>p.invoiceStatus==="ready").flatMap(p=>{
                    const units = p.finalUnits ?? p.uForecast ?? null;
                    const totalRev = units ? p.milestoneRate * units : 0;
                    return p.tasks.map((t,ti)=>{
                      const taskRev = totalRev * t.revPct;
                      const delta = (t.ecd && t.actualDate)
                        ? Math.round((new Date(t.actualDate) - new Date(t.ecd)) / 86400000) : null;
                      return (
                        <tr key={t.id} className="hr" style={{borderBottom:"0.5px solid #e8f5e0"}}>
                          <td style={{padding:"7px 12px",fontFamily:"'DM Mono',monospace",fontSize:11}}>{p.project||"-"}</td>
                          <td style={{padding:"7px 12px",color:"#555",maxWidth:140,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.milestone}</td>
                          <td style={{padding:"7px 12px",fontWeight:500}}>{t.name}</td>
                          <td style={{padding:"7px 12px"}}>
                            <span style={{fontSize:10,padding:"1px 6px",borderRadius:3,
                              background:TASK_TYPE_STYLE[getTaskType(t.name)]?.bg||"#eee",
                              color:TASK_TYPE_STYLE[getTaskType(t.name)]?.color||"#555",
                              fontWeight:600,textTransform:"uppercase"}}>
                              {TASK_TYPE_STYLE[getTaskType(t.name)]?.label||"-"}
                            </span>
                          </td>
                          <td style={{padding:"7px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,color:"#888780"}}>{t.ecd||"-"}</td>
                          <td style={{padding:"7px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,color:"#3B6D11",fontWeight:500}}>{t.actualDate||"-"}</td>
                          <td style={{padding:"7px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,
                            color:delta==null?"#ccc":delta<=0?"#3B6D11":"#A32D2D",fontWeight:delta!=null?600:400}}>
                            {delta==null?"-":delta===0?"On time":delta>0?`+${delta}d`:`${delta}d`}
                          </td>
                          <td style={{padding:"7px 12px",color:"#888780",textAlign:"right"}}>{Math.round(t.revPct*100)}%</td>
                          <td style={{padding:"7px 12px",fontWeight:600,color:"#3B6D11",textAlign:"right",whiteSpace:"nowrap"}}>
                            ${Math.round(taskRev).toLocaleString()}
                          </td>
                          <td style={{padding:"7px 12px",textAlign:"right",color:"#A32D2D"}}>
                            {(()=>{const c=(t.rdbHours??0)*(t.eeRate??t.templateEeRate??0);return c>0?"$"+Math.round(c).toLocaleString():"-";})()}
                          </td>
                          <td style={{padding:"7px 12px",textAlign:"right",fontWeight:700,
                            color:(()=>{const rev=taskRev;const c=(t.rdbHours??0)*(t.eeRate??t.templateEeRate??0);if(!c||!rev)return"#ccc";const m=Math.round((rev-c)/rev*100);return m>=40?"#3B6D11":m>=20?"#854F0B":"#A32D2D";})()}}>
                            {(()=>{const rev=taskRev;const c=(t.rdbHours??0)*(t.eeRate??t.templateEeRate??0);if(!c||!rev)return"-";return Math.round((rev-c)/rev*100)+"%";})()}
                          </td>
                          <td style={{padding:"7px 12px",color:t.resource?"#1a1a18":"#ccc"}}>{t.resource||"Unassigned"}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueView({ projects }) {
  const [groupBy, setGroupBy] = useState("taskType");
  const [weeksAhead, setWeeksAhead] = useState(12);

  const weekData = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

    const weeks = [];
    for (let i = 0; i < weeksAhead; i++) {
      const start = new Date(monday);
      start.setDate(monday.getDate() + i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      weeks.push({ start, end, label: `W${i+1} ${start.toLocaleDateString("en-US",{month:"short",day:"numeric"})}`, total: 0, byGroup: {} });
    }

    const unscheduled = { byGroup: {}, total: 0 };

    projects.forEach(p => {
      const units = p.finalUnits ?? p.uForecast ?? null;
      if (!units) return; // no units = no revenue to forecast
      const totalProjectRev = p.milestoneRate * units;

      p.tasks.forEach(t => {
        const taskRev = totalProjectRev * t.revPct;
        const rate = t.eeRate ?? t.templateEeRate ?? 0;
        const hours = t.loadForecast ?? 0;
        const taskStaffCost = rate * hours;
        const group = groupBy === "taskType"
          ? (TASK_TYPE_STYLE[getTaskType(t.name)]?.label || "Production")
          : groupBy === "customer"
          ? p.customer
          : p.program;

        if (t.ecd) {
          const ecd = new Date(t.ecd);
          ecd.setHours(0,0,0,0);
          const bucket = weeks.find(w => ecd >= w.start && ecd <= w.end);
          const dest = bucket
            ? bucket
            : ecd > weeks[weeks.length-1].end
            ? weeks[weeks.length-1]
            : ecd < weeks[0].start
            ? weeks[0]
            : null;
          if (dest) {
            dest.total += taskRev;
            dest.staffCost = (dest.staffCost||0) + taskStaffCost;
            dest.byGroup[group] = (dest.byGroup[group] || 0) + taskRev;
          }
        } else {
          unscheduled.total += taskRev;
          unscheduled.staffCost = (unscheduled.staffCost||0) + taskStaffCost;
          unscheduled.byGroup[group] = (unscheduled.byGroup[group] || 0) + taskRev;
        }
      });
    });

    return { weeks, unscheduled };
  }, [projects, groupBy, weeksAhead]);

  const allGroups = useMemo(() => {
    const s = new Set();
    weekData.weeks.forEach(w => Object.keys(w.byGroup).forEach(g => s.add(g)));
    Object.keys(weekData.unscheduled.byGroup).forEach(g => s.add(g));
    return [...s].sort();
  }, [weekData]);

  const totalScheduled = weekData.weeks.reduce((a, w) => a + w.total, 0);
  const totalScheduledCost = weekData.weeks.reduce((a, w) => a + (w.staffCost||0), 0);
  const grandTotal = totalScheduled + weekData.unscheduled.total;
  const grandCost = totalScheduledCost + (weekData.unscheduled.staffCost||0);
  const overallMargin = grandTotal > 0 ? Math.round((grandTotal - grandCost) / grandTotal * 100) : null;

  const GROUP_COLORS = [
    "#185FA5","#3B6D11","#854F0B","#A32D2D","#4A2C6E",
    "#0F6E56","#B5D4F4","#C0DD97","#FAC775","#F7C1C1",
    "#CEB2DC","#9FE1CB","#F5C4B3","#D3D1C7","#85B7EB",
  ];
  const colorOf = (g) => {
    if (groupBy === "taskType") {
      const k = Object.keys(TASK_TYPE_STYLE).find(k => TASK_TYPE_STYLE[k].label === g);
      if (k) return TASK_TYPE_STYLE[k].dot;
    }
    const idx = allGroups.indexOf(g) % GROUP_COLORS.length;
    return GROUP_COLORS[idx];
  };

  const maxWeekTotal = Math.max(...weekData.weeks.map(w => w.total), 1);

  const detailRows = useMemo(() => {
    const rows = [];
    projects.forEach(p => {
      const units = p.finalUnits ?? p.uForecast ?? null;
      if (!units) return;
      const totalRev = p.milestoneRate * units;
      p.tasks.forEach(t => {
        if (!t.ecd) return;
        const taskRev = totalRev * t.revPct;
        const rate = t.eeRate ?? t.templateEeRate ?? 0;
        const staffCost = rate * (t.loadForecast ?? 0);
        const grossMargin = taskRev > 0 ? Math.round((taskRev - staffCost) / taskRev * 100) : null;
        rows.push({
          ecd: t.ecd,
          project: p.project || "-",
          milestone: p.milestone,
          customer: p.customer,
          task: t.name,
          taskType: TASK_TYPE_STYLE[getTaskType(t.name)]?.label || "Production",
          revPct: t.revPct,
          taskRev,
          staffCost,
          grossMargin,
          status: t.status,
          resource: t.resource,
          hasResource: !!t.resource,
        });
      });
    });
    return rows.sort((a,b) => new Date(a.ecd) - new Date(b.ecd));
  }, [projects]);

  return (
    <div>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:500,color:"#1a1a18"}}>Revenue Forecast</div>
        <div style={{flex:1}}/>
        <div style={{fontSize:12,color:"#888780"}}>Group by:</div>
        {[["taskType","Task Type"],["customer","Customer"],["program","Program"]].map(([v,l])=>(
          <button key={v} onClick={()=>setGroupBy(v)} style={{padding:"4px 12px",fontSize:12,border:"1px solid",
            borderColor:groupBy===v?"#185FA5":"#ccc9c0",borderRadius:6,background:groupBy===v?"#E6F1FB":"#fff",
            color:groupBy===v?"#185FA5":"#555",cursor:"pointer",fontWeight:groupBy===v?500:400}}>{l}</button>
        ))}
        <div style={{fontSize:12,color:"#888780",marginLeft:8}}>Weeks:</div>
        {[8,12,16,24].map(w=>(
          <button key={w} onClick={()=>setWeeksAhead(w)} style={{padding:"4px 10px",fontSize:12,border:"1px solid",
            borderColor:weeksAhead===w?"#185FA5":"#ccc9c0",borderRadius:6,background:weeksAhead===w?"#E6F1FB":"#fff",
            color:weeksAhead===w?"#185FA5":"#555",cursor:"pointer"}}>{w}w</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:16}}>
        {[
          {l:"Total forecast",v:"$"+Math.round(grandTotal).toLocaleString(),s:"all tasks w/ units"},
          {l:"Scheduled rev",v:"$"+Math.round(totalScheduled).toLocaleString(),s:"tasks with ECD"},
          {l:"Forecast staff cost",v:"$"+Math.round(grandCost).toLocaleString(),s:"rate x load hrs"},
          {l:"Gross margin",v:overallMargin!==null?overallMargin+"%":"-",
            s:"(rev - cost) / rev",c:overallMargin!=null?(overallMargin>=40?"#3B6D11":overallMargin>=20?"#854F0B":"#A32D2D"):"#888780",
            b:overallMargin!=null?(overallMargin>=40?"#EAF3DE":overallMargin>=20?"#FAEEDA":"#FCEBEB"):"#fff"},
          {l:"Unscheduled",v:"$"+Math.round(weekData.unscheduled.total).toLocaleString(),s:"no ECD set",w:weekData.unscheduled.total>0},
          {l:"Avg / week",v:"$"+Math.round(totalScheduled/(weeksAhead||1)).toLocaleString(),s:`over ${weeksAhead} weeks`},
        ].map(s=>(
          <div key={s.l} style={{background:s.b||(s.w?"#FAEEDA":"#fff"),border:"0.5px solid #dddbd4",borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:s.c||(s.w?"#854F0B":"#888780"),textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:20,fontWeight:600,color:s.c||(s.w?"#854F0B":"#1a1a18")}}>{s.v}</div>
            <div style={{fontSize:11,color:"#aaa89e",marginTop:2}}>{s.s}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:12}}>
        {allGroups.map(g=>(
          <span key={g} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#555"}}>
            <span style={{width:10,height:10,borderRadius:2,background:colorOf(g),flexShrink:0,display:"inline-block"}}/>
            {g}
          </span>
        ))}
        {weekData.unscheduled.total > 0 &&
          <span style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#854F0B"}}>
            <span style={{width:10,height:10,borderRadius:2,background:"#FAEEDA",border:"1px dashed #BA7517",flexShrink:0,display:"inline-block"}}/>
            Unscheduled (${Math.round(weekData.unscheduled.total).toLocaleString()})
          </span>
        }
      </div>

      <div style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,padding:"16px 16px 12px",marginBottom:16,overflowX:"auto"}}>
        <div style={{minWidth:Math.max(600, weeksAhead*70)}}>
          <div style={{display:"flex",gap:0,alignItems:"flex-end",height:220,position:"relative"}}>
            {[0,25,50,75,100].map(pct=>(
              <div key={pct} style={{position:"absolute",left:0,right:0,bottom:`${pct}%`,
                borderTop:`0.5px solid ${pct===0?"#dddbd4":"#f0ede8"}`,
                display:"flex",alignItems:"center"}}>
                <span style={{fontSize:9,color:"#aaa89e",background:"#fff",paddingRight:4,marginTop:-8,whiteSpace:"nowrap"}}>
                  ${Math.round(maxWeekTotal*pct/100).toLocaleString()}
                </span>
              </div>
            ))}
            {weekData.weeks.map((w,wi)=>{
              const barH = maxWeekTotal > 0 ? (w.total/maxWeekTotal)*100 : 0;
              let yOffset = 0;
              return (
                <div key={wi} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",height:"100%",
                  justifyContent:"flex-end",padding:"0 2px",minWidth:0,position:"relative",zIndex:1}}>
                  <div style={{width:"100%",height:`${barH}%`,display:"flex",flexDirection:"column-reverse",overflow:"hidden",borderRadius:"3px 3px 0 0"}}>
                    {allGroups.map(g=>{
                      const gRev = w.byGroup[g] || 0;
                      if (!gRev) return null;
                      const segH = maxWeekTotal > 0 ? (gRev/w.total)*100 : 0;
                      return (
                        <div key={g} title={`${g}: $${Math.round(gRev).toLocaleString()}`}
                          style={{width:"100%",height:`${segH}%`,background:colorOf(g),minHeight:gRev>0?2:0}}/>
                      );
                    })}
                  </div>
                  {w.total > 0 && (
                    <div style={{position:"absolute",bottom:`${barH}%`,fontSize:8,color:"#555",
                      textAlign:"center",whiteSpace:"nowrap",marginBottom:2}}>
                      ${Math.round(w.total/1000).toFixed(0)}k
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:0,marginTop:4}}>
            {weekData.weeks.map((w,wi)=>(
              <div key={wi} style={{flex:1,textAlign:"center",fontSize:9,color:"#888780",
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 1px"}}>
                {w.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {detailRows.length > 0 ? (
        <div style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"0.5px solid #eee",display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:13,fontWeight:500}}>Scheduled tasks with ECD</div>
            <span style={{fontSize:11,color:"#888780"}}>{detailRows.length} tasks</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:"#f8f7f4"}}>
                {["ECD","Customer","Project","Milestone","Task","Type","Rev%","Task Revenue","Staff Cost","Margin","Status","Assignee"].map(h=>(
                  <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#888780",fontWeight:500,
                    borderBottom:"1px solid #eee",whiteSpace:"nowrap",fontSize:11}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{detailRows.map((r,i)=>(
                <tr key={i} className="hr" style={{borderBottom:"0.5px solid #f0ede8"}}>
                  <td style={{padding:"7px 12px",fontFamily:"'DM Mono',monospace",fontSize:11,whiteSpace:"nowrap"}}>{r.ecd}</td>
                  <td style={{padding:"7px 12px",color:"#555"}}>{r.customer}</td>
                  <td style={{padding:"7px 12px",fontFamily:"'DM Mono',monospace",fontSize:11}}>{r.project}</td>
                  <td style={{padding:"7px 12px",color:"#555",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.milestone}</td>
                  <td style={{padding:"7px 12px",fontWeight:500}}>{r.task}</td>
                  <td style={{padding:"7px 12px"}}>
                    <span style={{fontSize:10,padding:"1px 6px",borderRadius:3,
                      background:TASK_TYPE_STYLE[Object.keys(TASK_TYPE_STYLE).find(k=>TASK_TYPE_STYLE[k].label===r.taskType)]?.bg||"#eee",
                      color:TASK_TYPE_STYLE[Object.keys(TASK_TYPE_STYLE).find(k=>TASK_TYPE_STYLE[k].label===r.taskType)]?.color||"#555",
                      fontWeight:600,textTransform:"uppercase"}}>{r.taskType}</span>
                  </td>
                  <td style={{padding:"7px 12px",color:"#888780",textAlign:"right"}}>{Math.round(r.revPct*100)}%</td>
                  <td style={{padding:"7px 12px",fontWeight:600,color:"#1a1a18",textAlign:"right"}}>${Math.round(r.taskRev).toLocaleString()}</td>
                  <td style={{padding:"7px 12px",textAlign:"right",color:r.hasResource?"#A32D2D":"#aaa89e"}}>
                    {r.staffCost>0?"$"+Math.round(r.staffCost).toLocaleString():<span style={{fontSize:10}}>no hrs</span>}
                  </td>
                  <td style={{padding:"7px 12px",textAlign:"right",fontWeight:600,
                    color:r.grossMargin===null?"#ccc":r.grossMargin>=40?"#3B6D11":r.grossMargin>=20?"#854F0B":"#A32D2D"}}>
                    {r.grossMargin!==null?r.grossMargin+"%":"-"}
                  </td>
                  <td style={{padding:"7px 12px"}}>
                    {r.status&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:3,
                      background:STATUS_CFG[r.status]?.bg||"#eee",color:STATUS_CFG[r.status]?.color||"#555",fontWeight:500}}>{r.status}</span>}
                  </td>
                  <td style={{padding:"7px 12px",color:r.resource?"#1a1a18":"#ccc"}}>{r.resource||"Unassigned"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{background:"#fff",border:"0.5px solid #dddbd4",borderRadius:12,padding:"2rem",
          textAlign:"center",color:"#aaa89e",fontSize:13}}>
          No tasks have ECDs set yet. Add ECDs to tasks in the Projects tab to see revenue scheduled by week.
        </div>
      )}
    </div>
  );
}


// -- EXPORT UTILITIES ---------------------------------------------------------
function toCSV(rows, headers) {
  const escape = v => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? '"' + s.replace(/"/g,'""') + '"' : s;
  };
  return [headers, ...rows].map(r => r.map(escape).join(",")).join("\n");
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], {type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function ExportBar({tab, projects, roster}) {
  const [open, setOpen] = useState(false);

  const exports = {
    projects: [
      {label:"Projects CSV", fn:()=>{
        const rows = [];
        projects.forEach(p => {
          const units = p.finalUnits ?? p.uForecast ?? 0;
          const totalRev = p.milestoneRate * units;
          p.tasks.forEach((t,i) => {
            rows.push([
              p.customer, p.program, p.milestone, p.project||"",
              p.milestoneRate, p.uom, units,
              "T"+(i+1), t.name, Math.round(t.revPct*100)+"%",
              totalRev * t.revPct,
              t.resource||"", t.status, t.ecd||"", t.actualDate||"",
              t.rdbHours||"", t.loadForecast||"",
              t.eeRate||"", t.subRate||""
            ]);
          });
        });
        downloadCSV("projects.csv", toCSV(rows, [
          "Customer","Program","Milestone","Project","Milestone Rate","UOM","Units",
          "Task#","Task","Rev%","Task Revenue","Resource","Status","ECD","Actual Date",
          "RDB Hours","Load Forecast","EE Rate","Sub Rate"
        ]));
      }},
      {label:"Projects JSON", fn:()=>downloadJSON("projects.json", projects)},
    ],
    resources: [
      {label:"Resource Summary CSV", fn:()=>{
        const map = {};
        projects.forEach(p => p.tasks.forEach(t => {
          const k = t.resource || "Unassigned";
          if (!map[k]) map[k] = {tasks:0,rdbHours:0,complete:0};
          map[k].tasks++;
          if (t.rdbHours) map[k].rdbHours += t.rdbHours;
          if (t.status === "Complete") map[k].complete++;
        }));
        const rows = Object.entries(map).map(([name, s]) => {
          const emp = roster.find(r=>r.name===name);
          return [name, emp?.title||"", emp?.supervisor||"", emp?.org||"", emp?.rate||"",
            emp?.isSubcontractor?"Yes":"No", s.tasks, s.complete, s.rdbHours.toFixed(1)];
        });
        downloadCSV("resources.csv", toCSV(rows,[
          "Name","Title","Supervisor","Org","Rate","Subcontractor","Tasks Assigned","Tasks Complete","RDB Hours"
        ]));
      }},
    ],
    rdb: [
      {label:"RDB Reconciliation CSV", fn:()=>{
        const rows = [];
        projects.forEach(p => p.tasks.forEach(t => {
          if (!t.loadForecast && !t.rdbHours) return;
          rows.push([
            p.customer, p.program, p.milestone, p.project||"",
            t.name, t.resource||"", t.status,
            t.loadForecast?.toFixed(2)||"", t.rdbHours||"",
            t.rdbHours && t.loadForecast ? (t.rdbHours > t.loadForecast ? "Over" : "On Track") : ""
          ]);
        }));
        downloadCSV("rdb_reconciliation.csv", toCSV(rows,[
          "Customer","Program","Milestone","Project","Task","Resource","Status",
          "Planned Hours","Actual RDB Hours","Flag"
        ]));
      }},
    ],
    revenue: [
      {label:"Revenue Forecast CSV", fn:()=>{
        const rows = [];
        projects.forEach(p => {
          const units = p.finalUnits ?? p.uForecast ?? 0;
          const totalRev = p.milestoneRate * units;
          p.tasks.forEach(t => {
            if (!t.ecd) return;
            const taskRev = totalRev * t.revPct;
            const rate = t.eeRate ?? t.templateEeRate ?? 0;
            const staffCost = rate * (t.loadForecast ?? 0);
            const margin = taskRev > 0 ? Math.round((taskRev-staffCost)/taskRev*100) : "";
            rows.push([p.customer, p.program, p.milestone, p.project||"",
              t.name, t.ecd, Math.round(taskRev), Math.round(staffCost), margin+"%",
              t.resource||"Unassigned", t.status]);
          });
        });
        rows.sort((a,b)=>String(a[5]).localeCompare(String(b[5])));
        downloadCSV("revenue_forecast.csv", toCSV(rows,[
          "Customer","Program","Milestone","Project","Task","ECD",
          "Task Revenue","Staff Cost","Gross Margin","Resource","Status"
        ]));
      }},
    ],
    actual: [
      {label:"Actual Revenue CSV", fn:()=>{
        const rows = [];
        projects.forEach(p => {
          const units = p.finalUnits ?? p.uForecast ?? 0;
          const totalRev = p.milestoneRate * units;
          const completedTasks = p.tasks.filter(t=>t.actualDate);
          const earnedRev = completedTasks.reduce((s,t)=>s+totalRev*t.revPct,0);
          const allDone = p.tasks.length > 0 && completedTasks.length === p.tasks.length;
          rows.push([
            p.customer, p.program, p.milestone, p.project||"",
            allDone?"Ready to Invoice":completedTasks.length>0?"Partial":"None",
            completedTasks.length+"/"+p.tasks.length,
            Math.round(earnedRev), Math.round(totalRev)
          ]);
        });
        downloadCSV("actual_revenue.csv", toCSV(rows,[
          "Customer","Program","Milestone","Project","Invoice Status",
          "Tasks Done","Earned Revenue","Total Revenue"
        ]));
      }},
    ],
  };

  const currentExports = exports[tab] || exports.projects;
  const today = new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  return (
    <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:6,marginBottom:10,position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:5,padding:"5px 14px",fontSize:12,
          border:"1px solid #ccc9c0",borderRadius:6,background:open?"#f8f7f4":"#fff",
          color:"#555",cursor:"pointer",fontWeight:500}}>
        <span style={{fontSize:14}}>v</span> Export
      </button>
      {open&&(
        <div onClick={()=>setOpen(false)}
          style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99}} />
      )}
      {open&&(
        <div style={{position:"absolute",top:"100%",right:0,zIndex:100,
          background:"#fff",border:"0.5px solid #dddbd4",borderRadius:8,
          boxShadow:"0 4px 16px rgba(0,0,0,0.12)",minWidth:200,padding:"6px 0",marginTop:4}}>
          <div style={{padding:"6px 14px 4px",fontSize:10,color:"#aaa89e",
            textTransform:"uppercase",letterSpacing:"0.06em"}}>Export as CSV</div>
          {currentExports.map(({label,fn})=>(
            <button key={label} onClick={()=>{fn();setOpen(false);}}
              style={{display:"block",width:"100%",textAlign:"left",padding:"8px 14px",
                fontSize:12,border:"none",background:"none",color:"#1a1a18",cursor:"pointer"}}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({l,c="#888780",b="#F1EFE8",sz=11}) {
  return <span style={{fontSize:sz,padding:"2px 7px",borderRadius:5,background:b,color:c,fontWeight:500,whiteSpace:"nowrap",display:"inline-block"}}>{l}</span>;
}
function MiniStat({l,v,c="#1a1a18"}) {
  return (
    <div style={{background:"#f8f7f4",borderRadius:8,padding:"8px 10px"}}>
      <div style={{fontSize:10,color:"#aaa89e",textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
      <div style={{fontSize:14,fontWeight:500,color:c,marginTop:2}}>{v}</div>
    </div>
  );
}
function YD() { return <span title="PM input" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#e8c84a",marginLeft:3,verticalAlign:"middle"}}/>; }
function Sel({value,onChange,opts,ph}) {
  return (
    <div style={{position:"relative"}}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",height:32,padding:"0 28px 0 10px",border:"0.5px solid #ccc9c0",borderRadius:7,background:"#fff",fontSize:13,color:"#1a1a18",outline:"none",appearance:"none"}}>
        <option value="">{ph}</option>
        {opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
      </select>
      <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:10,color:"#888780"}}>v</span>
    </div>
  );
}
function Modal({onClose,title,children,w=600}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:14,width:"100%",maxWidth:w,maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid #eee"}}>
          <div style={{fontSize:15,fontWeight:600}}>{title}</div>
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#888",lineHeight:1}}>x</button>
        </div>
        <div style={{overflowY:"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
}
