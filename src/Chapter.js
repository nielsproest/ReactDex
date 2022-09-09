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

import API from "./MangaDexAPI/API";

import './css/Chapter.css';

import {
	Link,
	Navigate
} from "react-router-dom";

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

export const PageContext = React.createContext(0);

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

	//TODO: componentDidUpdate


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

		console.log(cfg.getValue("DISPLAY_TYPE"));
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
								<select value={chapter != null && chapter.getId()} className="form-control col" id="jump-chapter" onChange={(e) => { e.preventDefault(); this.jumpChapter(e); }}>
									{this.state.chapters}
								</select>
							</div>
							<a className="chapter-link-right col-auto arrow-link" title="" href="" data-action="chapter" data-chapter="" onClick={(e) => { e.preventDefault(); this.nextChapter(e); }}>
								<span className="fas fa-angle-right fa-fw" aria-hidden="true"></span>
							</a>
							<div className="col-auto py-2 pr-2 d-lg-none">
								<select className="form-control" id="jump-page" onChange={(e) => {
									//this.renderer.pageSet(e.target.value);
								}}>
									{Array.from(Array(chapter != null ? chapter.attributes.pages : 0).keys()).map((idx) => {
										return (<option value={idx}>Page {idx+1}</option>)
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
								<a title="Reader settings" className="btn btn-secondary col m-1 px-1" role="button" onClick={() => this.changeChild.current.openModal()}>
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
									onClick={(e) => {
										console.log("setValue", "both");
										cfg.setValue("DISPLAY_TYPE", "fit-both");
									}}
									>No resize</span>
								<span 
									className={`show-fit-both ${cfg.getValue("DISPLAY_TYPE") != "fit-both" && "d-none"}`}
									onClick={(e) => {
										console.log("setValue", "vertical");
										cfg.setValue("DISPLAY_TYPE", "fit-vertical");
									}}
									>Fit to container</span>
								<span 
									className={`show-fit-height ${cfg.getValue("DISPLAY_TYPE") != "fit-vertical" && "d-none"}`}
									onClick={(e) => {
										console.log("setValue", "horizontal");
										cfg.setValue("DISPLAY_TYPE", "fit-horizontal");
									}}
									>Fit height</span>
								<span 
									className={`show-fit-width ${cfg.getValue("DISPLAY_TYPE") != "fit-horizontal" && "d-none"}`}
									onClick={(e) => {
										console.log("setValue", "none");
										cfg.setValue("DISPLAY_TYPE", "none");
									}}
									>Fit width</span>
							</div>
							<div className="reader-controls-mode-rendering w-100 cursor-pointer px-2">
								<kbd>&nbsp;g</kbd>
								<span className="fas fa-book fa-fw" aria-hidden="true" title="Reader mode"></span>
								<span 
									className={`show-single-page`}
									>Single page</span>
								<span 
									className={`show-double-page d-none`}
									>Double page</span>
								<span 
									className={`show-long-strip d-none`}
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
								<span className="col-auto mx-1">©2021</span>
								<a href="/" className="col-auto mx-1">MangaDex</a>
							</div>
						</Col>
						<Col className="reader-controls-pages col-auto d-none d-lg-flex row no-gutters align-items-center">
							<a className="page-link-left col-auto arrow-link" href="" data-action="page" data-direction="left" data-by="1" onClick={(e) => { e.preventDefault(); /*this.renderer.pagePrev(e);*/ }}>
								<span className="fas fa-angle-left fa-fw" aria-hidden="true" title="Turn page left"></span>
							</a>
							<div className="col text-center reader-controls-page-text cursor-pointer">
								Page <span className="current-page">1</span> / <span className="total-pages">{chapter != null ? chapter.attributes.pages : 0}</span>
							</div>
							<div className="col text-center reader-controls-page-recommendations">
								Recommendations
							</div>
							<a className="page-link-right col-auto arrow-link" href="" data-action="page" data-direction="right" data-by="1" onClick={(e) => { e.preventDefault(); /*this.renderer.pageNext(e);*/ }}>
								<span className="fas fa-angle-right fa-fw" aria-hidden="true" title="Turn page right"></span>
							</a>
						</Col>
					</Row>
				</Row>
			</Container>
		)
	}
}

class ReaderMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pages: null
		};
	}

	componentDidMount() {
		API.chapterPages(this.props.chapter.getId()).then((c) => {
			this.setState({
				pages: c
			});
		});
	}

	render() {
		const pages = this.state.pages;

		/*
		document.getElementsByClassName("reader")[0].setAttribute("data-renderer", "fit-both");
		document.getElementsByClassName("reader")[0].setAttribute("data-direction", "ltr");
		document.getElementsByClassName("reader")[0].setAttribute("renderer", "single-page");
		*/

		const renderPages = () => {
			if (pages == null) {
				return (
					<div className="m-5 d-flex align-items-center justify-content-center" style={{color: "#fff", textShadow: "0 0 7px rgba(0,0,0,0.5)"}}>
						<span className="fas fa-circle-notch fa-spin position-absolute" style={{opacity: "0.5", fontSize: "7em"}} />
						<span className="loading-page-number" style={{fontSize: "2em"}}></span>
					</div>
				)
			}

			var dataTbl = pages.chapter.data;
			var dataSaverTbl = pages.chapter.dataSaver;

			return (
				dataTbl.map((_, idx) => {
					const displayed = (idx != (this.renderer != null ? this.renderer.pageCurrent() : 0)) ? "d-none" : "";
					const loading = idx < 5 ? "eager" : "lazy";
					const full_img = `${pages.baseUrl}/data/${pages.chapter.hash}/${dataTbl[idx]}`;
					const saver_img = `${pages.baseUrl}/data-saver/${pages.chapter.hash}/${dataSaverTbl[idx]}`;
					const img_url = false ? saver_img : full_img;
					const refreshidx = this.refreshCounter;

					return (
						<img
							className={`noselect nodrag cursor-pointer reader-image ${displayed}`}
							data-src={full_img}
							datasaver-src={saver_img}
							src={img_url}
							loading={loading}
							page={idx}
							onError={(e) => {
								/*API.reportImgProc({
									url: img_url
									success: false
									cached:
									bytes:
									duration:
								})*/
								this.fetchPages(parseInt(refreshidx));
							}}
							onLoad={(e) => {
								const bar = Array.from(document.getElementsByClassName("trail")[0].childNodes);
								bar[idx].classList.add("loaded");
							}}
						/>
					)
				})
			)
		}

		return (
			{/* reader main */},
			<Container className="reader-main col row no-gutters flex-column flex-nowrap noselect" style={{"flex":"1"}}>
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
					page={0}
				>
					{renderPages()}
				</div>
				<div className="reader-load-icon">
					<span className="fas fa-circle-notch fa-spin" aria-hidden="true"></span>
				</div>
				<div className="reader-page-bar col-auto d-none d-lg-flex directional">
					<div className="track cursor-pointer row no-gutters">
						<div className="trail position-absolute h-100" style={{display: "flex"}}>
							{Array.from(Array(pages != null ? pages.chapter.data.length : 0).keys()).map((idx) => {
								const _class = idx == 0 ? "thumb" : "";
								//notch for loading anim?

								//TODO: Better aim?
								return (
									<div 
										className={`${_class} notch h-100 w-100`}
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
class ReaderSettingsMenu extends React.Component {
	render() {
		return (<div></div>)
	}
}

export class ChapterDisplay extends React.Component {
	constructor(props) {
		super(props);
		//props: id
		this.state = {
			isMobile: this.isMobile(),
			chapter: null,
			config: null
		};
		this.changeChild=React.createRef();

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
				this.setState({
					config: saved
				});
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
	}

	isMobile() {
		return window.innerWidth < 992;
	}

	componentWillUnmount() {
		Array.from(document.getElementsByTagName("footer")).forEach((f) => {
			f.style.display = "unset";
		});

		window.removeEventListener("resize", this.resizeAnon, false);

		API.chapter({"ids": [this.props.id], "includes": ["manga", "scanlation_group", "user"]}).then((c) => {
			const ch = c.data[0];
			const manga = ch.GetRelationship("manga")[0];
			const group = ch.GetRelationship("scanlation_group");

			document.title = `${manga.getTitle()} - ${ch.getTitle()} - ReactDex`;

			//TODO: Sort by oneshot-volume-chapter (see reader/api.js line 241)
			this.setState({
				chapter: c.data[0]
			});
		});
	}

	UNSAFE_componentWillMount() {
		this.c_cfg.default();
	}

	componentDidMount() {

		Array.from(document.getElementsByTagName("footer")).forEach((f) => {
			f.style.display = "none";
		});

		window.addEventListener("resize", this.resizeAnon, false);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.id != this.props.id) {
			this.setState({
				chapter: null
			});
			this.componentDidMount();
		}
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
				{this.state.chapter != null ? (
					<React.Fragment>
						<ReaderSidebar ref={this.changeChild} chapter={this.state.chapter} cfg={this.c_cfg}/>
						<ReaderMain chapter={this.state.chapter} cfg={this.c_cfg}/>
						<ReaderSettingsMenu cfg={this.c_cfg}/>
					</React.Fragment>
				) : (<div>Loading...</div>)}
			</Container>
		)
	}
}
