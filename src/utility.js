//utility.js
import React from "react";
import Placeholder from "react-bootstrap/Placeholder";

export const TIME_MS = 0.001;
export const TIME_SECOND = 1;
export const TIME_MINUTE = TIME_SECOND * 60;
export const TIME_HOUR = TIME_MINUTE * 60;
export const TIME_DAY = TIME_HOUR * 24;
export const TIME_WEEK = TIME_DAY * 7;
export const TIME_MONTH = TIME_DAY * 30;
export const TIME_YEAR = TIME_MONTH * 12;
export const TIME_DECADE = TIME_YEAR * 10;
export const TIME_CENTURY = TIME_YEAR * 100;
export const TIME_MILLENNIUM = TIME_YEAR * 1000;
export const TIME_TABLE = [
	[TIME_DECADE, "decade"],
	[TIME_YEAR, "year"],
	[TIME_MONTH, "month"],
	[TIME_DAY, "day"],
	[TIME_HOUR, "hour"],
	[TIME_MINUTE, "min"],
	[TIME_SECOND, "sec"],
	[TIME_MS, "ms"],
];

export function getTimeDiff(ms) {
	const s = ms * TIME_MS;

	if (ms > 0) {
		for (var i in TIME_TABLE) {
			const key = TIME_TABLE[i][0]
			const value = TIME_TABLE[i][1];
			
			var val = s / key;
			if (val >= 1) {
				val = Math.round(val);
				return `${val} ${value}${(val > 1 && value != "ms") ? "s" : ""}`;
			}
		}
	}

	return "0";
}

export function APlaceholder(num, as="span") {
	return (
		<Placeholder as={as} xs={num} animation="glow">
			<Placeholder xs={num}/>
		</Placeholder>
	)
}

export function IntArray(num) {
	return Array.from(Array(num).keys());
}

export function userUUID(user) {
	return user != null && user.getUser() != null && user.getUser().getId();
}

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export const slugify = str =>
	str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');

export function isDevBuild() {
	return (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
}

export function getElementByXpath(path) {
	return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

export function checkVisible(elm) {
	var rect = elm.getBoundingClientRect();
	var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
	return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

export class ElementUpdater extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			elem: this.fetch()
		}
		this.timer = null;
	}

	fetch() {
		return this.props.func();
	}

	componentDidMount() {
		this.timer = setTimeout(() => {
			this.setState({
				elem: this.fetch()
			});
			this.componentDidMount();
		}, this.props.delay);
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}

	render() {
		return (
			<React.Fragment>
				{this.state.elem}
			</React.Fragment>
		)
	}
}