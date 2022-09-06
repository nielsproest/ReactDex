import React from "react";

//See search_header.tpl.php
//See manga_list.tpl.php
//See quick_search.tpl.php
//See *.req.php

class MangaUIDetailed extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	render() { 
		return (<React.Fragment></React.Fragment>) 
	}
}
class MangaUIExpandedList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}
	render() { 
		return (<React.Fragment></React.Fragment>) 
	}
}
class MangaUISimpleList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}
	render() { 
		return (<React.Fragment></React.Fragment>) 
	}
}
class MangaUIGrid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}
	render() { 
		return (<React.Fragment></React.Fragment>) 
	}
}

export class SearchUI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	/*
	Title modes:
	0: Detailed
	1: Expanded list
	2: Simple list
	3: Grid
	*/
	render() {
		return (
			<React.Fragment>
				<div class="row my-2">
					<div class="col-auto ml-auto">
						Sort by
						<select class="manga-sort-select form-control d-inline-block w-auto ml-1">
							<option value="2" selected>Title &#x25B2;</option>
							<option value="3" >Title &#x25BC;</option>
							<option value="0" >Last updated &#x25B2;</option>
							<option value="1" >Last updated &#x25BC;</option>
							<option value="4" >Comments &#x25B2;</option>
							<option value="5" >Comments &#x25BC;</option>
							<option value="6" >Rating &#x25B2;</option>
							<option value="7" >Rating &#x25BC;</option>
							<option value="8" >Views &#x25B2;</option>
							<option value="9" >Views &#x25BC;</option>
							<option value="10">Follows &#x25B2;</option>
							<option value="11">Follows &#x25BC;</option>
						</select>
					</div>
				</div>
				<MangaUIDetailed/>
			</React.Fragment>
		)
	}
}