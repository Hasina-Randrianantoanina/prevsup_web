export function bodyHeight(document) {
	var body = document.body,
		html = document.documentElement;

	const height = Math.max(body.scrollHeight, body.offsetHeight,
		html.clientHeight, html.scrollHeight, html.offsetHeight);

	return height;
}

export function addDataChart(chart, data, labels, backgroundColor) {
	removeDataChart(chart);
	labels.forEach((label) => {
		chart.data.labels.push(label);
	})

	if(chart.config.type === "doughnut") {
		chart.data.datasets.forEach((dataset) => {
			data.forEach((d) => {
				dataset.data.push(d);
				backgroundColor.forEach((color) => {
					dataset.backgroundColor.push(color);
				})
			})
		});
	} else {
		chart.data.datasets.forEach((dataset) => {
			data.forEach((d) => {
				dataset.data.push(d);
			})
		});
	}
	
	chart.update();
}

function removeDataChart(chart) {
	chart.data.labels.splice(0, chart.data.labels.length);
	chart.data.datasets.forEach((dataset) => {
		dataset.data.splice(0, dataset.data.length)
		if(chart.config.type === "doughnut") {
			dataset.backgroundColor.splice(0, dataset.backgroundColor.length);
		}
	});

	chart.update();
}