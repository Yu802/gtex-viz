"use strict";

import {range} from "d3-array";
import {json} from "d3-fetch";
import {randomNormal, randomUniform} from "d3-random";
import {select} from "d3-selection";

import Violin from "./modules/Violin";
import GroupedViolin from "./modules/GroupedViolin";
import {getGtexUrls, parseGeneExpressionForViolin} from "./modules/gtexDataParser";


export function buildGrouped(rootId){
    const domIds = {
        chart: "grouped-chart"
    };
     // create all the sub <div> elements in the rootId
    Object.keys(domIds).forEach((k)=>{
        $(`<div id="${domIds[k]}"/>`).appendTo(`#${rootId}`);
    });
    const margin = _setMargins(50, 50, 150, 50);
    const dim = _setDimensions(1200, 200, margin);
    const dom = select(`#${domIds.chart}`).append("svg")
        .attr("width", dim.outerWidth)
        .attr("height", dim.outerHeight)
        .attr("id", domIds.svg)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
   // get some data
    const gencode = "ENSG00000065613.9,ENSG00000106624.4";
    // const gencode = "ENSG00000106624.4";

    const colors = {
        "ENSG00000065613.9": "#97a4ac",
        "ENSG00000106624.4": "#77c4d3"
    };
    json(getGtexUrls().geneExp + gencode)
        .then(function(d){
            const data = parseGeneExpressionForViolin(d, true, colors);
            const violin = new GroupedViolin(data);
            const tissues = data.reduce((arr,d)=>{arr[d.tissueId]=1; return arr},{});
            const sort = (a, b)=>{
                if (a>b) return 1;
                if (a<b) return -1;
                return 0;
            };

            // SVG rendering
            violin.render(dom, dim.width, dim.height, 0, 50, Object.keys(tissues).sort(sort), [], [-3, 3], "log10(TPM)", false, true);
        })
        .catch(function(err){console.error(err)});
}

export function build(rootId){
    const domIds = {
        toolbar: "toolbar",
        chart: "chart",
        tooltip: "tooltip",
        clone: "cloneTestViolin", // this one is needed for downloading svg;
        svg: "testViolin",
        buttons: {
            save: "save",
            reset: "reset"
        }
    };

    // create all the sub <div> elements in the rootId
    Object.keys(domIds).forEach((k)=>{
        if("buttons" == k) return;
        $(`<div id="${domIds[k]}"/>`).appendTo(`#${rootId}`);
    });

    const data = _genereateRandomData(50);
    const margin = _setMargins();
    const dim = _setDimensions();
    let violin = new Violin(data);
    const dom = select(`#${domIds.chart}`).append("svg")
        .attr("width", dim.outerWidth)
        .attr("height", dim.outerHeight)
        .attr("id", domIds.svg)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    violin.render(dom, dim.width, dim.height, "Random Number");
    const tooltip = violin.createTooltip(domIds.tooltip);

    const toolbar = violin.createToolbar(domIds.toolbar, tooltip);
    toolbar.createDownloadButton('save', domIds.svg, "testViolin", domIds.clone);
    const resetClickEvent = function(){
        violin.zoom(dom);
    };
    toolbar.createResetButton('reset', resetClickEvent)

}

/**
 * Set the dimensions of the violin plot
 * @param width {Integer}
 * @param height {Integer}
 * @param margin {Object} with attr: top, right, bottom, left
 * @returns {{width: number, height: number, outerWidth: number, outerHeight: number}}
 * @private
 */
function _setDimensions(width=1200, height=250, margin=_setMargins()){
    return {
        width: width,
        height: height,
        outerWidth: width + (margin.left + margin.right),
        outerHeight: height + (margin.top + margin.bottom)
    }
}

/**
 * Set the margins of the violin plot
 * @param top {Integer}
 * @param right {Integer}
 * @param bottom {integer}
 * @param left {Integer}
 * @returns {{top: number, right: number, bottom: number, left: number}}
 * @private
 */
function _setMargins(top=50, right=50, bottom=50, left=50){
    return {
        top: top,
        right: right,
        bottom: bottom,
        left: left
    };
}

/**
 * Genereate random data sets for the violin
 * data = [
        {
            label: "dataset 1",
            values: [a list of numerical values with a normal distribution]
         },
         {
            label: "dataset 2",
            values: [a list of numerical values with a normal distribution]
         }
    ]
 * @param N {Integer} the number of data sets
 * @private
 * returns a list of data objects
 * reference: https://github.com/d3/d3-random
 */
function _genereateRandomData(N=5){
    // values: a list of 100 random numbers with a normal (Gaussian) distribution
    const data =  range(0, N).map((d) => {
        const mu = 100 + Math.random()*20;
        const sigma = 1;
        return {
            label: `dataset ` + d,
            values: range(0, 2000).map(randomNormal(mu, sigma)),
            color: "burlywood"
        }
    });
    return data;
}