import React from "react";
import Container from 'react-bootstrap/Container';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import axios from "axios";

import API, { CORS_BYPASS } from "./MangaDexAPI/API";
import { IntArray, APlaceholder } from "./utility";

import './css/Chapter.css';

import {
	Link,
	Navigate
} from "react-router-dom";
import { UserContext } from "./user-context";

const DefaultReaderSettings = {
	"DISPLAY_TYPE": {
		values: [
			"fit-vertical",
			"fit-horizontal",
			"fit-both",
			"none"
		],
		default: "fit-both"
	},
	"READER_TYPE": {
		values: [
			"single-page",
			"double-page",
			"long-strip"
		],
		default: "single-page"
	},
	"DATASAVER": {
		values: [true,false],
		default: false
	},
	"DIRECTION": {
		values: [
			"ltr",
			"rtl"
		],
		default: "ltr"
	},
	"PRELOAD": {
		values: [
			0,1,2,3,4,5
		],
		default: 5
	},
	"PRELOAD_ALL": {
		values: [true,false],
		default: false
	}
}

class SinglePageReader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {}
	componentWillUnmount() {}

	isLongStrip() {
		return false;
	}

	render() {
		const cfg = this.props.cfg;
		const page = this.props.page;
		const pages = this.props.pages;

		return ([
			pages.map((full_img, idx) => {
				const displayed = (idx != page && !this.isLongStrip()) ? "d-none" : "";

				return (
					<img
						className={`noselect nodrag cursor-pointer reader-image fillimg ${displayed}`}
						src={full_img}
						page={idx}
					/>
				)
			}),
			IntArray(this.props.lpages - pages.length).map((idx) => {
				const pid = pages.length + idx;
				const displayed = (pid != page && !this.isLongStrip()) ? "d-none" : "";

				//TODO: Center this
				return (
					<div 
						page={pid}
						className={`m-5 d-flex align-items-center justify-content-center ${displayed}`}
						style={{
							height: "5vh",
							width: "5vh",
							color: "#fff", 
							textShadow: "0 0 7px rgba(0,0,0,0.5)"
						}}
					>
						<span className="fas fa-circle-notch fa-spin" style={{opacity: "0.5", fontSize: "7em"}} />
						<span className="loading-page-number" style={{fontSize: "2em"}}></span>
					</div>
				)
			}),
			this.isLongStrip() ? (<p>End</p>) : (<React.Fragment></React.Fragment>)
		])
	}
	/*scrollEvent(e) {
		var visible = null;
		Array.from(this.pageAll()).forEach((e) => {
			if (checkVisible(e)) { //TODO: Check middle
				visible = e.getAttribute("page");
			}
		});
		if (visible) {
			visible = parseInt(visible)
			this.pageCurrentSet(visible);
			//TODO: Load when near
		}
	}
	pageScroll(smooth=true) {
		if (smooth) {
			pages[page].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
		} else {
			pages[page].scrollIntoView();
		}
	}*/
	pageNext(e) {
		const page = parseInt(e.target.attributes.page.value);
		this.props.setPage(page+1);
	}
	pagePrev(e) {
		const page = parseInt(e.target.attributes.page.value);
		this.props.setPage(page-1);
	}
	pageClick(e) {
		const element = e.target;
		var rect = element.getBoundingClientRect();
		const width = rect.right - rect.left;
		const middle = rect.left + (width / 2);

		const clicked_right = e.clientX > middle;

		if (clicked_right) {
			this.pageNext(e);
		} else {
			this.pagePrev(e);
		}
	}
	pageSet(idx) {
		this.props.setPage(idx);
	}
}
class DoublePageReader extends SinglePageReader {}
class LongStripReader extends SinglePageReader {
	scrollEvent(e) {
		/*var visible = null;
		Array.from(this.renderRef().pageAll()).forEach((e) => {
			if (checkVisible(e)) { //TODO: Check middle
				visible = e.getAttribute("page");
			}
		});
		if (visible) {
			visible = parseInt(visible)
			this.renderRef().pageCurrentSet(visible);
		}*/
	}

	componentDidMount() {
		super.componentDidMount();

		const render_window = document.getElementsByClassName("reader-images")[0];
		render_window.addEventListener("scroll", this.scrollEvent, false);
	}
	componentWillUnmount() {
		super.componentWillUnmount();

		const render_window = document.getElementsByClassName("reader-images")[0];
		render_window.removeEventListener("scroll", this.scrollEvent, false);
	}
	isLongStrip() {
		return true;
	}
}

class ReaderMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pages: [],
			lpages: null
		};
		this.onReadCalled = false;
		this.changeChild=React.createRef();
		this.webWorker = null;
	}

	createWorker() {
		if (
			this.props.chapter == null || //No chapter yet
			(this.webWorker != null && this.refreshCounter != 0) //Didnt switch page
		) {
			return;
		}
		if (this.webWorker != null) {
			this.webWorker.terminate();
		}

		this.webWorker=new window.Worker("/ImgWorker.js");
		this.refreshCounter = 1;

		this.webWorker.onerror = () => {
			console.log("WW-Error");
		};
		this.webWorker.onmessage = (e) => {
			if (e.data) {
				const data = e.data.result;

				const ffff = () => {
					var pages = this.state.pages;
					pages.push(data.url); //TODO?: Relies on proper order
					//TODO: Why does this work?
	
					/*this.setState({
						pages: pages
					})*/
	
					this.setLoaded(data.page);
				}

				if (this.state.lpages == null) {
					this.setState({
						lpages: IntArray(data.pages).map((_) => false)
					}, ffff);
				} else {
					ffff();
				}

				console.log("WW-Response", e.data.result);

			} else {
				console.log("WW-Error");
			}
		};

		//TODO: Load on demand instead of all of them
		this.webWorker.postMessage({msg: {
			cmd: "fetch", 
			args: [this.props.chapter.getId(),null],
			datasave: this.props.cfg.getValue("DATASAVER"),
			CORS_BYPASS: CORS_BYPASS
		}});
	}

	componentDidMount() {
		this.createWorker();

		/*if (this.props.chapter != null) {
			this.fetchPages(0);
		}*/
	}
	componentWillUnmount() {
		if (this.timer != null) {
			clearTimeout(this.timer);
		}
		if (this.webWorker != null) {
			this.webWorker.terminate();
		}
	}
	componentDidUpdate(prevProps) {
		const prevId = prevProps.chapter != null && prevProps.chapter.getId();
		const currId = this.props.chapter != null && this.props.chapter.getId();
		if (prevId != currId) {
			this.refreshCounter = 0;
			this.setState({
				pages: [],
				lpages: null
			});
			this.componentDidMount();
		}
	}

	renderRef() {
		return this.changeChild.current;
	}
	setLoaded(idx) {
		var lpages = this.state.lpages;
		lpages[idx] = true;
		this.setState({
			lpages: lpages
		});
	}
	render() {
		const pages = this.state.pages;
		const lpages = this.state.lpages;
		const page = this.props.page;
		const cfg = this.props.cfg;

		const renderPages = () => {
			if (pages == null) {
				return (
					<div className="m-5 d-flex align-items-center justify-content-center" style={{color: "#fff", textShadow: "0 0 7px rgba(0,0,0,0.5)"}}>
						<span className="fas fa-circle-notch fa-spin position-absolute" style={{opacity: "0.5", fontSize: "7em"}} />
						<span className="loading-page-number" style={{fontSize: "2em"}}></span>
					</div>
				)
			}

			if (cfg.getValue("READER_TYPE") == "double-page") {
				return <DoublePageReader 
					ref={this.changeChild} 
					page={page} 
					lpages={lpages != null ? lpages.length : 0}
					setPage={(i) => this.props.setPage(i)} 
					pages={pages} 
					cfg={cfg} 
				/>
			} else if (cfg.getValue("READER_TYPE") == "long-strip") {
				return <LongStripReader 
					ref={this.changeChild} 
					page={page} 
					lpages={lpages != null ? lpages.length : 0}
					setPage={(i) => this.props.setPage(i)} 
					pages={pages} 
					cfg={cfg} 
				/>
			} else {
				return <SinglePageReader 
					ref={this.changeChild} 
					page={page} 
					lpages={lpages != null ? lpages.length : 0}
					setPage={(i) => this.props.setPage(i)} 
					pages={pages} 
					cfg={cfg} 
				/>
			}
		}

		return (
			{/* reader main */},
			<Container className="reader-main col row no-gutters flex-column flex-nowrap noselect p-0" style={{"flex":"1"}}>
				<noscript>
					<div className="alert alert-danger text-center">
						JavaScript is required for this reader to work.
					</div>
				</noscript>
				<div className="reader-goto-top d-flex d-lg-none justify-content-center align-items-center fade cursor-pointer">
					<span className="fas fa-angle-up"></span>
				</div>
				<div 
					className="reader-images row no-gutters flex-nowrap text-center cursor-pointer directional"
					onClick={(e) => this.renderRef().pageClick(e)}
				>
					{renderPages()}
				</div>
				<div className="reader-load-icon">
					<span className="fas fa-circle-notch fa-spin" aria-hidden="true"></span>
				</div>
				<div className="reader-page-bar col-auto d-none d-lg-flex directional">
					<div className="track cursor-pointer row no-gutters">
						<div className="trail position-absolute h-100" style={{display: "flex"}}>
							{IntArray(lpages != null ? lpages.length : 0).map((idx) => {
								const _selected = idx == page && "thumb";
								const _loaded = this.state.lpages[idx] && "loaded";

								//TODO: Better aim?
								return (
									<div 
										className={`${_selected} ${_loaded} notch h-100 w-100`}
										onClick={(e) => {
											this.renderRef().pageSet(idx)
										}}
									>
									</div>
								)
							})}
						</div>
						<div className="notches row no-gutters h-100 w-100 directional"></div>
						<div className="notch-display col-auto m-auto px-3 py-1 noevents"></div>
					</div>
				</div>
			</Container>
		)
	}
}

class ReaderSidebar extends React.Component {
	constructor(props) {
		super(props);
		//props: chapter, cfg
		this.state = {
			chapters: []
		};
	}

	componentDidMount() {
		const ch = this.props.chapter;
		if (ch == null) {
			return
		}

		const manga = ch.GetRelationship("manga")[0];
		const user = ch.GetRelationship("user")[0];
		const group = ch.GetRelationship("scanlation_group");

		API.aggregate(
			manga.getId(), 
			(group != null && group.length > 0) ? {"groups": [group[0].getId()]} : {}
		).then((cs) => {
			var chs = [];

			Object.values(cs.volumes).forEach((v) => {
				var chaps = Object.values(v.chapters);
				//TODO: Gather all then sort to avoid mixed volume-chapter issues

				chaps.sort((a,b) => parseFloat(a.chapter) - parseFloat(b.chapter));

				{chaps.forEach((c) => {
					chs.push(<option value={c.id}>{this.cvTitle(v.volume,c.chapter)}</option>)
				})}
			})

			this.setState({
				chapters: chs
			});
		});
	}
	componentDidUpdate(prevProps) {
		const prevId = prevProps.chapter != null && prevProps.chapter.getId();
		const currId = this.props.chapter != null && this.props.chapter.getId();
		if (prevId != currId) {
			this.componentDidMount();
		}
	}

	//TODO: componentDidUpdate

	_jumpChapter(id) {
		console.log("jump", id);
		return this.props.nav(`/chapter/${id}`);
	}
	jumpChapter(e) {
		return this._jumpChapter(e.target.value);
	}
	backToManga() {
		return this.props.nav(this.props.chapter.GetRelationship("manga")[0].getUrl());
	}
	nextChapter(e) {
		const chaps = Array.from(document.getElementById("jump-chapter").childNodes);
		const chap = chaps.filter((c) => c.value == this.props.chapter.getId())[0];
		const chap_idx = chaps.indexOf(chap);
		const chap_nextidx = chap_idx + 1;
		if (chap_nextidx < chaps.length) {
			return this._jumpChapter(chaps[chap_nextidx].value);
		} else {
			this.backToManga();
		}
	}
	prevChapter(e) {
		const chaps = Array.from(document.getElementById("jump-chapter").childNodes);
		const chap = chaps.filter((c) => c.value == this.props.chapter.getId())[0];
		const chap_idx = chaps.indexOf(chap);
		const chap_nextidx = chap_idx - 1;
		if (chap_nextidx >= 0) {
			return this._jumpChapter(chaps[chap_nextidx].value);
		} else {
			//this.backToManga();
		}
	}

	cvTitle(volume, chapter) {
		var str = "";
		if (volume != "none") {
			str += `Volume. ${volume} `;
		}
		str += `Ch. ${chapter}`;

		return str;
	}


	scanDisplay() {
		const chapter = this.props.chapter;

		if (chapter == null) {
			return (
				<li>
					<span className="rounded flag flag-unknown mr-1"></span>
					&nbsp;
					<a></a>
				</li>
			)
		}

		var scangroup = chapter.GetRelationship("scanlation_group");
		if (scangroup != null && scangroup.length > 0) {
			scangroup = scangroup[0];
			return (
				<li>
					<span className={`rounded flag flag-${scangroup.getLang()} mr-1`}></span>
					&nbsp;
					<Link to={scangroup.getUrl()} style={{fontWeight: "bold"}}>{scangroup.getName()}</Link>
				</li>
			)
		}

		var scanuser = chapter.GetRelationship("user");
		if (scanuser != null && scanuser.length > 0) {
			scanuser = scanuser[0];
			return (
				<li>
					<span className="rounded flag flag-en mr-1"></span>
					&nbsp;
					<Link to={scanuser.getUrl()} style={{fontWeight: "bold"}}>{scanuser.getName()}</Link>
				</li>
			)
		}

		return (
			<li>
				<span className="rounded flag flag-unknown mr-1"></span>
				&nbsp;
				<a></a>
			</li>
		)
	}

	render() {
		const cfg = this.props.cfg;
		const chapter = this.props.chapter;
		const pages = chapter != null ? chapter.attributes.pages : 0;
		const page = this.props.reader.current != null ? this.props.page : 0;
		var c_title = "";
		var m_title = "";
		var m_href = "";
		const reader = document.getElementsByClassName("reader")[0];

		if (chapter != null) {
			const manga = chapter.GetRelationship("manga")[0];

			c_title = chapter.getTitle();
			m_title = manga.getTitle();
			m_href = manga.getUrl();
		}

		return (
			{/* reader controls */},
			<Container className="reader-controls-container p-0">
				<Row className="reader-controls-wrapper bg-reader-controls no-gutters flex-nowrap" style={{"zIndex": "1"}}>
					<div id="reader-controls-collapser-bar" className="reader-controls-collapser col-auto align-items-center justify-content-center cursor-pointer" onClick={(e) => {
						if (reader.classList.contains("hide-sidebar")) {
							reader.classList.remove("hide-sidebar");
						} else {
							reader.classList.add("hide-sidebar");
						}
					}}>
						<span className="fas fa-caret-right fa-fw arrow-link" aria-hidden="true" title="Collapse menu" style={{
							position: "relative",
							top: "50%",
							marginLeft: "auto",
							marginRight: "auto",
							display: "unset"
						}} />
					</div>
					<Row className="reader-controls col row no-gutters flex-column flex-nowrap">
						<Col className="reader-controls-title col-auto text-center px-2 pb-2">
							<Row className="no-gutters">
								<div id="reader-controls-collapser-button" className="reader-controls-collapser col-auto justify-content-center cursor-pointer">
									<span className="fas fa-caret-right fa-fw arrow-link" aria-hidden="true" title="Collapse menu"></span>
								</div>
								<div className="col pt-2 manga-title-col" style={{"fontSize":"1.25em"}}>
									<span className={`rounded flag flag-${chapter != null && chapter.getLang()}`}></span>
									&nbsp;
									<Link to={m_href} className="manga-link" data-action="url" title={m_title}>{m_title}</Link>
									{/* Remove d-none if H */}
									<span className="chapter-tag-h badge badge-danger d-none">H</span>
									{/* Remove d-none if doujinshi */}
									<span className="chapter-tag-doujinshi badge badge-primary d-none" style={{"backgroundColor":"#735ea5"}}>Dj</span>
								</div>
							</Row>
							<div className="d-none d-lg-block">
								<span className="chapter-title" data-chapter-id="">{c_title}</span> 
									{/* Remove d-none if end-chapter */}
								<span className="chapter-tag-end badge badge-primary d-none">END</span>
							</div>
						</Col>
						<Col className="reader-controls-chapters col-auto row no-gutters align-items-center">
							<a className="chapter-link-left col-auto arrow-link" title="" href="" data-action="chapter" data-chapter="" onClick={(e) => { e.preventDefault(); this.prevChapter(e); }}>
								<span className="fas fa-angle-left fa-fw" aria-hidden="true"></span>
							</a>
							<div className="col py-2">
								<select 
									value={chapter != null && chapter.getId()} 
									className="form-control col" 
									id="jump-chapter" 
									onChange={(e) => { e.preventDefault(); this.jumpChapter(e); }}
								>
									{this.state.chapters}
								</select>
							</div>
							<a className="chapter-link-right col-auto arrow-link" title="" href="" data-action="chapter" data-chapter="" onClick={(e) => { e.preventDefault(); this.nextChapter(e); }}>
								<span className="fas fa-angle-right fa-fw" aria-hidden="true"></span>
							</a>
							<div className="col-auto py-2 pr-2 d-lg-none">
								<select className="form-control" id="jump-page" onChange={(e) => {
									this.props.setPage(e.target.value);
								}}>
									{IntArray(pages).map((idx) => {
										return (<option value={idx} selected={page == idx ? true : false}>Page {idx+1}</option>)
									})}
								</select>
							</div>
						</Col>
						<Col className="reader-controls-groups col-auto row no-gutters">
							<ul className="col list-unstyled p-2 m-0 chapter-link">
								{this.scanDisplay()}
							</ul>
						</Col>
						<Col className="reader-controls-unsupported col-auto row no-gutters p-2 text-danger d-none"></Col>
						<Col className="reader-controls-actions col-auto row no-gutters p-1">
							<div className="col row no-gutters" style={{"minWidth":"120px"}}>
								{/* TODO: Open modal */}
								<a title="Reader settings" className="btn btn-secondary col m-1 px-1" role="button" onClick={() => this.props.panel.current.openModal()}>
									<span className="fas fa-cog fa-fw"></span> Reader settings
								</a>
								{/*<a title="Recommendations" className="btn btn-secondary col m-1 px-1 d-none" role="button" id="recommendations-button">
									<span className="fas fa-thumbs-up fa-fw"></span> Recommendations
								</a>*/}
								<div className="w-100 d-block d-lg-block"></div>
								{/* <a title="Hide header" className="btn btn-secondary col m-1" role="button" id="hide-header-button">
									<span className="far fa-window-maximize fa-fw"></span>
								</a>
								<a title="Fullscreen" className="btn btn-secondary col m-1" role="button" id="fullscreen-button">
								<span className="fa fa-arrows-alt fa-fw"></span>
								</a>
								<a title="Comment" data-action="url" className="btn btn-secondary col m-1" role="button" id="comment-button">
									<strong className="comment-amount" style={{"fontSize":"0.9em"}}></strong> <span className="far fa-comments fa-fw"></span>
								</a>
								<a title="Report" className="btn btn-secondary col m-1" role="button" id="report-button" data-toggle="modal" data-target="#modal-report">
									<span className="fas fa-flag fa-fw"></span>
								</a>*/}
								<div className="w-100 d-block d-lg-block"></div>
							</div>
						</Col>
						<Col className="reader-controls-mode col-auto d-lg-flex d-none flex-column align-items-start" style={{"flex":"0 1 auto", "overflow":"hidden"}}>
							<div className="reader-controls-mode-display-fit w-100 cursor-pointer pt-2 px-2" style={{cursor: "pointer"}}>
								<kbd>^f</kbd>
								<span className="fas fa-compress fa-fw" aria-hidden="true" title="Display fit"></span>
								<span 
									className={`show-no-resize ${cfg.getValue("DISPLAY_TYPE") != "none" && "d-none"}`}
									onClick={(e) => cfg.setValue("DISPLAY_TYPE", "fit-both")}
									>No resize</span>
								<span 
									className={`show-fit-both ${cfg.getValue("DISPLAY_TYPE") != "fit-both" && "d-none"}`}
									onClick={(e) => cfg.setValue("DISPLAY_TYPE", "fit-vertical")}
									>Fit to container</span>
								<span 
									className={`show-fit-height ${cfg.getValue("DISPLAY_TYPE") != "fit-vertical" && "d-none"}`}
									onClick={(e) => cfg.setValue("DISPLAY_TYPE", "fit-horizontal")}
									>Fit height</span>
								<span 
									className={`show-fit-width ${cfg.getValue("DISPLAY_TYPE") != "fit-horizontal" && "d-none"}`}
									onClick={(e) => cfg.setValue("DISPLAY_TYPE", "none")}
									>Fit width</span>
							</div>
							<div className="reader-controls-mode-rendering w-100 cursor-pointer px-2">
								<kbd>&nbsp;g</kbd>
								<span className="fas fa-book fa-fw" aria-hidden="true" title="Reader mode"></span>
								<span 
									className={`show-single-page ${cfg.getValue("READER_TYPE") != "single-page" && "d-none"}`}
									onClick={(e) => cfg.setValue("READER_TYPE", "double-page")}
									>Single page</span>
								<span 
									className={`show-double-page ${cfg.getValue("READER_TYPE") != "double-page" && "d-none"}`}
									onClick={(e) => cfg.setValue("READER_TYPE", "long-strip")}
									>Double page</span>
								<span 
									className={`show-long-strip ${cfg.getValue("READER_TYPE") != "long-strip" && "d-none"}`}
									onClick={(e) => cfg.setValue("READER_TYPE", "single-page")}
									>Long strip</span>
								{/*<span className="show-recommendations">Recommendations</span>
								<span className="show-alert">Alert</span>*/}
							</div>
							<div className="reader-controls-mode-direction w-100 cursor-pointer pb-2 px-2">
								<kbd>&nbsp;h</kbd>
								{/* PRE DISABLED <span className="fas fa-exchange-alt fa-fw" aria-hidden="true" title="Direction"></span>
								<span className="direction-ltr">Left to right</span>
								<span className="direction-rtl">Right to left</span> */}
								<span className="show-direction-ltr">
									<span className="fas fa-long-arrow-alt-right fa-fw" aria-hidden="true" title="Direction"></span> Left to right
								</span>
								<span className="show-direction-rtl d-none">
									<span className="fas fa-long-arrow-alt-left fa-fw" aria-hidden="true" title="Direction"></span> Right to left
								</span>
							</div>
						</Col>
						<Col className="reader-controls-footer col-auto mt-auto d-none d-lg-flex justify-content-center" style={{"flex":"0 1 auto", "overflow":"hidden"}}>
							<div className="text-muted text-center text-truncate row flex-wrap justify-content-center p-2 no-gutters">
								{/*<span class="col-auto mx-1">©2021</span>*/}
								<a href="https://mangadex.org/" target="_blank" rel="noopener noreferrer" title="" className="col-auto mx-1">MangaDex</a>
								<a href="https://mangadex.network/" target="_blank" rel="noopener noreferrer" title="" className="col-auto mx-1">MD@Home</a>
								<a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer" title="" className="col-auto mx-1">Cloudflare</a>
								<a href="https://github.com/SagsMug/ReactDex" target="_blank" rel="noopener noreferrer" title="" className="col-auto mx-1">Github</a>
							</div>
						</Col>
						<Col className="reader-controls-pages col-auto d-none d-lg-flex row no-gutters align-items-center">
							<a className="page-link-left col-auto arrow-link" href="" data-action="page" data-direction="left" data-by="1" onClick={(e) => { e.preventDefault(); this.props.setPage(this.props.page-1); }}>
								<span className="fas fa-angle-left fa-fw" aria-hidden="true" title="Turn page left"></span>
							</a>
							<div className="col text-center reader-controls-page-text cursor-pointer">
								Page <span className="current-page">{page + 1}</span> / <span className="total-pages">{chapter != null ? chapter.attributes.pages : 0}</span>
							</div>
							<div className="col text-center reader-controls-page-recommendations">
								Recommendations
							</div>
							<a className="page-link-right col-auto arrow-link" href="" data-action="page" data-direction="right" data-by="1" onClick={(e) => { e.preventDefault(); this.props.setPage(this.props.page+1); }}>
								<span className="fas fa-angle-right fa-fw" aria-hidden="true" title="Turn page right"></span>
							</a>
						</Col>
					</Row>
				</Row>
			</Container>
		)
	}
}

class ReaderSettingsMenu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false
		};
	}

	openModal = () => this.setState({ isOpen: true });
	closeModal = () => this.setState({ isOpen: false });

	setAdvancedSettings(val) {
		if (val == null) {
			val = false;
		}
	
		if (val) {
			document.getElementById("modal-settings").classList.add("show-advanced");
		} else {
			document.getElementById("modal-settings").classList.remove("show-advanced");
		}
	
		return val;
	}

	render() {
		const cfg = this.props.cfg;

		return (
			{/* settings modal */},
			<Modal 
				id="modal-settings"
				show={this.state.isOpen} 
				onHide={this.closeModal} 
				animation={true}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Reader settings</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Container>
						<Row className="form-group">
							<Col>
								<Form.Check
									label="Display advanced (*) settings"
									onChange={(e) => this.setAdvancedSettings(e.target.checked)}
								/>
							</Col>
						</Row>
						<hr />
						<h5><span className='fas fa-book-open fa-fw' aria-hidden='true' title=''></span> Display settings</h5>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Fit display to</label>
							<Col>
								<Row>
									<Button 
										variant="secondary" 
										className="col px-2"
										active={cfg.getValue("DISPLAY_TYPE") == "fit-both"}
										onClick={(_) => cfg.setValue("DISPLAY_TYPE", "fit-both")}
									>
										Container
									</Button>
									<Button 
										variant="secondary" 
										className="col px-2"
										active={cfg.getValue("DISPLAY_TYPE") == "fit-horizontal"}
										onClick={(_) => cfg.setValue("DISPLAY_TYPE", "fit-horizontal")}
									>
										Width</Button>
									<Button 
										variant="secondary" 
										className="col px-2"
										active={cfg.getValue("DISPLAY_TYPE") == "fit-vertical"}
										onClick={(_) => cfg.setValue("DISPLAY_TYPE", "fit-vertical")}
									>
										Height
									</Button>
									<Button 
										variant="secondary" 
										className="col px-2"
										active={cfg.getValue("DISPLAY_TYPE") == "none"}
										onClick={(_) => cfg.setValue("DISPLAY_TYPE", "none")}
									>
										No resize
									</Button>
								</Row>
							</Col>
						</div>
						<div className="form-group row advanced">
							<label className="col-sm-4 col-form-label">Maximum container width</label>
							<div className="col my-auto input-group">
								<input data-setting="containerWidth" className="form-control" type="number" min="0" step="50" placeholder="Leave empty for 100%" />
								<div className="input-group-append">
									<span className="input-group-text">pixels</span>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Page rendering</label>
							<div className="col">
								<div className="row">
									<Button 
										variant="secondary"
										className="col px-2"
										active={cfg.getValue("READER_TYPE") == "single-page"}
										onClick={(_) => cfg.setValue("READER_TYPE", "single-page")}
									>Single</Button>
									<Button 
										variant="secondary"
										className="col px-2"
										active={cfg.getValue("READER_TYPE") == "double-page"}
										onClick={(_) => cfg.setValue("READER_TYPE", "double-page")}
									>Double</Button>
									<Button 
										variant="secondary"
										className="col px-2"
										active={cfg.getValue("READER_TYPE") == "long-strip"}
										onClick={(_) => cfg.setValue("READER_TYPE", "long-strip")}
									>Long strip</Button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Direction</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="direction" className="btn btn-default btn-secondary col px-2">Left to right</button>
									<button type="button" data-value="2" data-setting="direction" className="btn btn-default btn-secondary col px-2">Right to left</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Language-based chapter filtering</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="restrictChLang" className="btn btn-default btn-secondary col px-2">Show all languages</button>
									<button type="button" data-value="1" data-setting="restrictChLang" className="btn btn-default btn-secondary col px-2">Hide other languages</button>
								</div>
							</div>
						</div>
						<hr />
						<h5><span className='fas fa-columns fa-fw' aria-hidden='true' title=''></span> Layout settings</h5>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Header</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="hideHeader" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="1" data-setting="hideHeader" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Sidebar</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="hideSidebar" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="1" data-setting="hideSidebar" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Page bar</label>
							<div className="col d-none d-lg-block">
								<div className="row">
									<button type="button" data-value="0" data-setting="hidePagebar" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="1" data-setting="hidePagebar" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
							<div className="col d-lg-none">
								<div className="row">
									<button type="button" disabled className="btn btn-default btn-secondary col px-2">Hidden on the mobile layout</button>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-sm-4 col-form-label">Sidebar collapser style</label>
							<div className="col d-none d-lg-block">
								<div className="row">
									<button type="button" data-value="0" data-setting="collapserStyle" className="btn btn-default btn-secondary col px-2">Corner button</button>
									<button type="button" data-value="1" data-setting="collapserStyle" className="btn btn-default btn-secondary col px-2">On-hover bar</button>
								</div>
							</div>
							<div className="col d-lg-none">
								<div className="row">
									<button type="button" disabled className="btn btn-default btn-secondary col px-2">Hidden on the mobile layout</button>
								</div>
							</div>
						</div>
						<div className="form-group row advanced">
							<label className="col-sm-4 col-form-label">Chapter dropdown titles</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="showDropdownTitles" className="btn btn-default btn-secondary col px-2">Visible</button>
									<button type="button" data-value="0" data-setting="showDropdownTitles" className="btn btn-default btn-secondary col px-2">Hidden</button>
								</div>
							</div>
						</div>
						<hr />
						<h5><span className='fas fa-hand-pointer fa-fw' aria-hidden='true' title=''></span> Input settings</h5>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Hide cursor over images</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="hideCursor" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="hideCursor" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Tap/click target area</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="tapTargetArea" className="btn btn-default btn-secondary col px-2">Entire container</button>
									<button type="button" data-value="0" data-setting="tapTargetArea" className="btn btn-default btn-secondary col px-2">Images only</button>
								</div>
							</div>
						</div>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Turn page by tapping/clicking</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="pageTapTurn" className="btn btn-default btn-secondary col px-2">Directional turn</button>
									<button type="button" data-value="2" data-setting="pageTapTurn" className="btn btn-default btn-secondary col px-2">Always turn forward</button>
									<button type="button" data-value="0" data-setting="pageTapTurn" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Turn page in long strip mode</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="pageTurnLongStrip" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="pageTurnLongStrip" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Turn page by vertical scrolling</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="pageWheelTurn" className="btn btn-default btn-secondary col px-2">Mouse wheel + keys</button>
									<button type="button" data-value="2" data-setting="pageWheelTurn" className="btn btn-default btn-secondary col px-2">Mouse wheel</button>
									<button type="button" data-value="0" data-setting="pageWheelTurn" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Keyboard scrolling method</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="2" data-setting="scrollingMethod" className="btn btn-default btn-secondary col px-2">Browser native</button>
									<button type="button" data-value="0" data-setting="scrollingMethod" className="btn btn-default btn-secondary col px-2">Browser native + WASD</button>
									<button type="button" data-value="1" data-setting="scrollingMethod" className="btn btn-default btn-secondary col px-2">Screen portion</button>
								</div>
							</div>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Touchscreen swipe direction</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="0" data-setting="swipeDirection" className="btn btn-default btn-secondary col px-2">Normal</button>
									<button type="button" data-value="1" data-setting="swipeDirection" className="btn btn-default btn-secondary col px-2">Inverted</button>
								</div>
							</div>
						</div>
						<div className="row form-group">
							<label className="col-sm-4 col-form-label">Touchscreen swipe sensitivity</label>
							<div className="col my-auto">
								<select className="form-control" data-setting="swipeSensitivity">
									<option value="0">Off</option>
									<option value="1">Very low</option>
									<option value="2">Low</option>
									<option value="3">Normal</option>
									<option value="4">High</option>
									<option value="5">Very high</option>
								</select>
							</div>
						</div>
						<hr />
						<h5><span className='fas fa-folder-open fa-fw' aria-hidden='true' title=''></span> Other settings</h5>
						<div className="row form-group mb-1">
							<label className="col-sm-4 col-form-label">Preload images (0 to <span className="preload-max-value">5</span>)</label>
							<div className="col my-auto">
								<input data-setting="preloadPages" className="form-control" type="number" min="0" max="5" placeholder="The amount of images" />
							</div>
						</div>
						<div className="row form-group text-right">
							<small className="col">Note: Chapters with images loaded via MD@H will always be fully preloaded.</small>
						</div>
						<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">Preload this entire chapter</label>
							<div className="col">
								<div className="row">
									<button type="button" id="preload-all" className="btn btn-default btn-secondary col px-2" disabled>Logged in users only</button>
								</div>
							</div>
						</div>
						{/*<div className="row form-group">
							<label className="col-sm-4 col-form-label">Warn about chapter gaps</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="gapWarning" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="gapWarning" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>*/}
						<Row className="form-group">
							<label className="col-sm-4 col-form-label">
								Data saver <a href="/thread/252554"><span className="fas fa-info-circle fa-fw" title="More information" /></a>
							</label>
							<Col>
								<Row>
									<Button 
										variant="secondary" 
										className="col px-2"
										active={cfg.getValue("DATASAVER") == false}
										onClick={(_) => cfg.setValue("DATASAVER", false)}
									>
										Original images
									</Button>
									<Button 
										variant="secondary" 
										className="col px-2"
										active={cfg.getValue("DATASAVER") == true}
										onClick={(_) => cfg.setValue("DATASAVER", true)}
									>
										Compressed images
									</Button>
								</Row>
							</Col>
						</Row>
						{/*<div className="row form-group advanced">
							<label className="col-sm-4 col-form-label">[BETA] Recommendations</label>
							<div className="col">
								<div className="row">
									<button type="button" data-value="1" data-setting="betaRecommendations" className="btn btn-default btn-secondary col px-2">Enabled</button>
									<button type="button" data-value="0" data-setting="betaRecommendations" className="btn btn-default btn-secondary col px-2">Disabled</button>
								</div>
							</div>
						</div>*/}
						<hr />
						<div>
							<h4><span className='fas fa-keyboard fa-fw' aria-hidden='true' title=''></span> Keyboard shortcuts</h4>
							<p>
								<kbd>^</kbd> = shift key
								<br />
								<kbd>^f</kbd> = shift + f
							</p>
							<ul className="list-unstyled container">
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>f</kbd>
									</div>
									<div className="col pl-2">Toggle between fit display to container and width</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^f</kbd>
									</div>
									<div className="col pl-2">Toggle between fit display to height and no resize</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>g</kbd>
										<kbd>^g</kbd>
									</div>
									<div className="col pl-2">Toggle between the page rendering options</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>h</kbd>
									</div>
									<div className="col pl-2">Toggle between the reader directions</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>r</kbd>
									</div>
									<div className="col pl-2">Toggle header visibility</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>t</kbd>
									</div>
									<div className="col pl-2">Toggle side bar visibility</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>y</kbd>
									</div>
									<div className="col pl-2">Toggle page bar visibility</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^r</kbd>
										<kbd>^t</kbd>
										<kbd>^y</kbd>
									</div>
									<div className="col pl-2">Show/hide all header, side bar and page bar</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^m</kbd>
									</div>
									<div className="col pl-2">Exit to the manga's main page</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^k</kbd>
									</div>
									<div className="col pl-2">Exit to the chapter's comments</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^q</kbd>
										<kbd>^e</kbd>
									</div>
									<div className="col pl-2">Go to the next/previous chapter depending on the direction</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>&larr;&uarr;&darr;&rarr;</kbd>
										<kbd>wasd</kbd>
									</div>
									<div className="col pl-2">Scroll the screen and turn pages</div>
								</li>
								<li className="row no-gutters">
									<div className="col-2 text-right">
										<kbd>^&larr;</kbd>
										<kbd>^&rarr;</kbd>
										<kbd>^a</kbd>
										<kbd>^d</kbd>
									</div>
									<div className="col pl-2">Shift by a single page in double page mode</div>
								</li>
							</ul>
						</div>
					</Container>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={this.closeModal}>
						<span className='fas fa-undo fa-fw' aria-hidden='true' title='' />
						&nbsp;
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}

export class ChapterDisplay extends React.Component {
	constructor(props) {
		super(props);
		//props: id
		this.changeChild=React.createRef();
		this.changeSettings=React.createRef();
		this.changeReader=React.createRef();

		this.resizeAnon = () => {
			this.setState({
				isMobile: this.isMobile()
			});
		};

		this.c_cfg = {
			default: () => {
				var saved = JSON.parse(localStorage.getItem("READER_CFG"));
				console.log(saved);
				if (saved == null) {
					saved = {};
					for (var key in DefaultReaderSettings) {
						saved[key] = DefaultReaderSettings[key].default;
					}
				}
				
				if (this.c_cfg.hasMissingFeature()) {
					saved = this.c_cfg.addMissing(saved);
				}
		
				localStorage.setItem("READER_CFG", JSON.stringify(saved));
				return saved;
			},
			hasMissingFeature: () => {
				return false;
			},
			addMissing: (cfg) => {
				return cfg;
			},
			setValue: (name, value) => {
				var cfg = this.state.config;

				if (DefaultReaderSettings[name].values.includes(value)) {
					cfg[name] = value;
				}

				localStorage.setItem("READER_CFG", JSON.stringify(cfg));
				this.setState({
					config: cfg
				})
			},
			getValue: (name) => {
				return this.state.config[name];
			}
		}
		this.state = {
			isMobile: this.isMobile(),
			chapter: null,
			config: this.c_cfg.default(),
			page: 0
		};
		this.onReadCalled = false;
	}

	static contextType = UserContext;

	isMobile() {
		return window.innerWidth < 992;
	}

	componentWillUnmount() {
		document.getElementById("root").classList.remove("hide-footer");

		window.removeEventListener("resize", this.resizeAnon, false);
	}

	componentDidMount() {
		document.getElementById("root").classList.add("hide-footer");

		window.addEventListener("resize", this.resizeAnon, false);

		API.chapter({"ids": [this.props.id], "includes": ["manga", "scanlation_group", "user"]}).then((c) => {
			const ch = c.data[0];
			const manga = ch.GetRelationship("manga")[0];
			const group = ch.GetRelationship("scanlation_group");

			document.title = `${manga.getTitle()} - ${ch.getTitle()} - ReactDex`;

			//TODO: Sort by oneshot-volume-chapter (see reader/api.js line 241)
			this.setState({
				chapter: ch
			});
		});
	}
	componentDidUpdate(prevProps) {
		if (prevProps.id != this.props.id) {
			this.setState({
				chapter: null,
				page: 0
			});
			this.onReadCalled = true;
			this.componentDidMount();
		}
	}

	setPage(idx) {
		const { user, setUser } = this.context;

		const chapter = this.state.chapter;
		const num = chapter.attributes.pages;
		if (0 <= idx && idx < num) {
			this.setState({
				page: idx
			});
		} else if (0 > idx) {
			this.changeChild.current.prevChapter(null);
		} else if (idx >= num) {
			this.changeChild.current.nextChapter(null);
		}

		if ((idx+1) >= Math.round(num * 0.75)) {
			if (!this.onReadCalled) {
				this.onReadCalled = true;

				if (user != null) {
					console.log("onread");
					const manga = chapter.GetRelationship("manga")[0];
					API.readChapter(manga.getId(),[chapter.getId()],[])
				}
			}
		}
	}
	getPage() {
		return this.state.page;
	}

	render() {
		var fit_type = "";
		var fit_class = "";
		const display_type = this.c_cfg.getValue("DISPLAY_TYPE");
		if (display_type == "fit-vertical") {
			fit_type = "fit-vertical";
			fit_class = "fit-vertical";
		} else if (display_type == "fit-horizontal") {
			fit_type = "fit-horizontal";
			fit_class = "fit-horizontal";
		} else if (display_type == "fit-both") {
			fit_type = "fit-both";
			fit_class = "fit-vertical fit-horizontal";
		}

		const mobile_class = this.state.isMobile ? 'layout-vertical' : 'layout-horizontal';

		//TODO: Use bootstrap placeholder for missing stuff
		return (
			<Container 
				className={`reader row flex-column no-gutters ${mobile_class} ${fit_class}`} 
				style={{
					/* marginBottom: "-50px", */
					marginTop: "-10px"  //Counteract default margins
				}} 
				data-display={fit_type} 
				data-direction={this.c_cfg.getValue("DIRECTION")} 
				data-renderer={this.c_cfg.getValue("READER_TYPE")} 
			>
				<React.Fragment>
					<ReaderSidebar 
						ref={this.changeChild} 
						page={this.getPage()} 
						setPage={(i) => this.setPage(i)} 
						reader={this.changeReader} 
						panel={this.changeSettings} 
						chapter={this.state.chapter} 
						cfg={this.c_cfg} 
						nav={this.props.nav} 
					/>
					<ReaderMain 
						ref={this.changeReader} 
						page={this.getPage()} 
						setPage={(i) => this.setPage(i)} 
						chapter={this.state.chapter} 
						cfg={this.c_cfg} 
					/>
					<ReaderSettingsMenu 
						ref={this.changeSettings} 
						cfg={this.c_cfg} 
					/>
				</React.Fragment>
			</Container>
		)
	}
}
