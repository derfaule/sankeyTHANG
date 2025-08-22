document.addEventListener('DOMContentLoaded', function() {
    // Define the data for the Sankey diagram
    const originalData = {
        "nodes": [
            { "node": 0, "name": "Step 1: Survey", "color": "#FFD706FF" },
            { "node": 1, "name": "usage", "color": "#478DB0FF" },
            { "node": 2, "name": "commitment", "color": "#352055FF" },
            { "node": 3, "name": "price", "color": "#FF9A79FF"},
            { "node": 4, "name": "value proposition", "color": "#922A10FF"},
            { "node": 5, "name": "bug/tech", "color": "#922A10FF" },
            { "node": 6, "name": "Dismiss", "color": "#1C436EFF" },
            { "node": 7, "name": "something else", "color": "#F4471CFF" },
            { "node": 8, "name": "WEB_3Info_20 - Copy", "color": "#006800FF"},
            { "node": 9, "name": "WEB-Offer-coupon-20 - copy", "color": "#A962CFFF"},
            { "node": 10, "name": "no, I'll stay", "color": "#3AD1D1FF"},
            { "node": 11, "name": "yes, cancel my membership", "color": "#FF5599FF"},
            { "node": 12, "name": "Cancel", "color": "#922A10FF" },
            { "node": 13, "name": "Retain", "color": "#1C436EFF" },
            { "node": 14, "name": "WB-1 tell us more / value proposition-20 - Copy", "color": "#F4471CFF" },
            { "node": 15, "name": "submit WB-1", "color": "#006800FF" },
            { "node": 16, "name": "WEB-1ExitSurvey-something else-20 - Copy", "color": "#A962CFFF" },
            { "node": 17, "name": "Submit WEB-1", "color": "#3AD1D1FF" },
            { "node": 18, "name": "no, please cancel", "color": "#FF5599FF" },
            { "node": 19, "name": "accept offer", "color": "#FFD706FF" }
        ],
        "links": [
            { "source": 0, "target": 1, "value": 248 },
            { "source": 0, "target": 2, "value": 128 },
            { "source": 0, "target": 3, "value": 52 },
            { "source": 0, "target": 4, "value": 12 },
            { "source": 0, "target": 5, "value": 8 },
            { "source": 0, "target": 6, "value": 39 },
            { "source": 0, "target": 7, "value": 35 },
            { "source": 5, "target": 8, "value": 8 },
            { "source": 8, "target": 10, "value": 3 },
            { "source": 8, "target": 11, "value": 377 },
            { "source": 8, "target": 6, "value": 11 },
            { "source": 3, "target": 9, "value": 52 },
            { "source": 2, "target": 9, "value": 128 },
            { "source": 1, "target": 9, "value": 248 },
            { "source": 9, "target": 19, "value": 26 },
            { "source": 9, "target": 6, "value": 17 },
            { "source": 9, "target": 18, "value": 351 },
            { "source": 18, "target": 8, "value": 351 },
            { "source": 4, "target": 14, "value": 12 },
            { "source": 14, "target": 15, "value": 10 },
            { "source": 15, "target": 8, "value": 10 },
            { "source": 7, "target": 16, "value": 35 },
            { "source": 16, "target": 17, "value": 26 },
            { "source": 16, "target": 6, "value": 2 },
            { "source": 17, "target": 8, "value": 26 },
            { "source": 11, "target": 12, "value": 377 },
            { "source": 6, "target": 13, "value": 69 },
            { "source": 10, "target": 13, "value": 3 },
            { "source": 19, "target": 13, "value": 26 }
        ]
    };

    const totalValue = originalData.links.reduce((acc, curr) => acc + curr.value, 0);

    const showAllButton = document.getElementById('show-all-button');
    showAllButton.addEventListener('click', () => {
        drawSankey('all');
    });

    function getPathLinks(startNode, allLinks, allNodes) {
        const links = [];
        const nodesToProcess = new Set([startNode.node]);
        const processedLinks = new Set();
        
        while (nodesToProcess.size > 0) {
            const nextNodesToProcess = new Set();
            allLinks.forEach(link => {
                if (nodesToProcess.has(link.source) && !processedLinks.has(link.source + '-' + link.target)) {
                    links.push(link);
                    nextNodesToProcess.add(link.target);
                    processedLinks.add(link.source + '-' + link.target);
                }
            });
            nodesToProcess.clear();
            nextNodesToProcess.forEach(node => nodesToProcess.add(node));
        }
        return links;
    }

    function drawSankey(filterNodeName) {
        d3.select("#sankey-chart").selectAll("*").remove();

        let filteredLinks;
        if (filterNodeName === 'all') {
            filteredLinks = originalData.links;
        } else {
            const startNode = originalData.nodes.find(n => n.name === filterNodeName);
            if (startNode) {
                filteredLinks = getPathLinks(startNode, originalData.links, originalData.nodes);
            } else {
                filteredLinks = [];
            }
        }

        const uniqueNodes = new Set();
        filteredLinks.forEach(link => {
            uniqueNodes.add(link.source);
            uniqueNodes.add(link.target);
        });

        const filteredNodes = originalData.nodes.filter(node => uniqueNodes.has(node.node));
        
        // Re-index nodes for Sankey layout
        const nodeMap = new Map(filteredNodes.map((d, i) => [d.node, i]));
        const finalData = {
            nodes: filteredNodes.map(d => ({...d, node: nodeMap.get(d.node)})),
            links: filteredLinks.map(d => ({
                ...d,
                source: nodeMap.get(d.source),
                target: nodeMap.get(d.target)
            }))
        };

        // Set the dimensions of the chart
        const container = d3.select("#sankey-chart");
        const width = 1000;
        const height = 600;

        const svg = container.attr("viewBox", `0 0 ${width} ${height}`)
                             .attr("preserveAspectRatio", "xMidYMid meet")
                             .append("g");

        const tooltip = d3.select(".sankey-tooltip");

        // Define the sankey generator
        const sankey = d3.sankey()
            .nodeId(d => d.node)
            .nodeWidth(40)
            .nodePadding(30)
            .extent([[1, 1], [width - 1, height - 6]]);

        // Create the Sankey graph
        const graph = sankey(finalData);

        // Create the links
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke", d => d.source.color || "#CCCCCC")
            .style("stroke-width", d => Math.max(1, d.width))
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                       .html(`<strong>${d.source.name}</strong> &rarr; <strong>${d.target.name}</strong><br>Value: ${d.value}`);
                
                d3.selectAll('.link').style('stroke-opacity', 0.1);
                d3.select(this).style('stroke-opacity', 1);
            })
            .on("mouseout", function(event, d) {
                tooltip.style("opacity", 0);
                d3.selectAll('.link').style('stroke-opacity', 0.6);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            });

        // Create the nodes
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .on("click", (event, d) => {
                 if (d.name === "Step 1: Survey") {
                    drawSankey('all');
                 } else {
                    drawSankey(d.name);
                 }
            });

        node.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .style("fill", d => d.color || "#CCCCCC")
            .style("stroke", "#555")
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                       .html(`<strong>${d.name}</strong><br>Value: ${d.value}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                tooltip.style("opacity", 0);
            });

        node.append("text")
            .attr("x", d => d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(d => {
                const percentage = ((d.value / totalValue) * 100).toFixed(1);
                return `${d.name} (${d.value}, ${percentage}%)`;
            })
            .filter(d => d.x0 < width / 2)
            .attr("x", d => d.x1 + 6)
            .attr("text-anchor", "start");
    }
    
    drawSankey('all'); // Initial draw
});
