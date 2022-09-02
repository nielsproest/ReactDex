import React from "react";
import Badge from "react-bootstrap/Badge";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Carousel from "react-bootstrap/Carousel";
import Pagination from 'react-bootstrap/Pagination';

import { UserContext } from "./user-context";

import {
	Link
} from "react-router-dom";

import { 
	display_fa_icon, 
	display_alert, 
	display_manga_link_v2, 
	display_short_title, 
	display_user_link, 
	display_user_link_v2,
	display_group_link_v2 ,
	display_lang_flag_v3,
	display_labels
} from "./partials"

import API from "./MangaDexAPI/API";
import { slugify, capitalizeFirstLetter } from "./utility";

//TODO: Move direct access (.attribute) functions to API classes

//TODO: Move to util class maybe
export class DPagination extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: props.page ? props.page : 0
		};
	}

	//TODO: Find a nicer way
	pages() { return this.props.pages ? this.props.pages : 1; }
	dlimit() { return this.props.dlimit ? this.props.dlimit : 5; }
	sizeof() { return this.props.sizeof ? this.props.sizeof : 15; }
	callback() { return this.props.callback ? this.props.callback : (i) => {}; }

	render() {
		const page = this.state.page;
		const pages = this.pages();
		const dlimit = this.dlimit();
		const sizeof = this.sizeof();
		const callback = this.callback();

		const cclick = (i) => {
			this.setState({
				page: i
			}, () => {
				callback(this.state.page);
			});
		}
		const cdown = () => {
			return cclick(Math.max(0,page-1));
		}
		const cup = () => {
			return cclick(Math.min(pages-1,page+1));
		}

		//First part
		let items = [
			(
				<React.Fragment>
					<Pagination.First onClick={(e) => cclick(0)}/>
					<Pagination.Prev onClick={(e) => cdown()}/>
				</React.Fragment>
			)
		];

		//Add all pages
		let tm_item = [];
		for (let number = 0; number < pages; number++) {
			tm_item.push(
				<Pagination.Item key={number} active={number === page} onClick={(e) => cclick(number)}>
					{number+1}
				</Pagination.Item>,
			);
		}

		//If too many, prune
		if (tm_item.length > dlimit) {
			const act = tm_item.filter((i) => i.props.active)[0]
			const idx = tm_item.indexOf(act);

			const startcut = Math.max(0,idx-Math.ceil((dlimit-1)/2));
			const endcut = Math.min(pages,idx+Math.ceil(dlimit/2));

			if (endcut < pages) {
				tm_item = tm_item.slice(0, startcut > 0 ? endcut : dlimit+1);
				tm_item.push((<Pagination.Ellipsis />));
			}

			if (startcut > 0) {
				tm_item = tm_item.slice(endcut < pages ? startcut : pages-dlimit);
				tm_item = [(<Pagination.Ellipsis />)].concat(tm_item);
			}
		}

		//Add finish
		items = items.concat(tm_item);
		items = items.concat(
			[
				(
					<React.Fragment>
						<Pagination.Next onClick={(e) => cup()}/>
						<Pagination.Last onClick={(e) => cclick(pages-1)}/>
					</React.Fragment>
				)
			]
		)

		return (
			<React.Fragment>
				<p className='mt-3 text-center'>Showing {page * sizeof} to {Math.min((page+1) * sizeof, pages * sizeof)} of {pages * sizeof} chapters</p>
				<Pagination className='justify-content-center'>
					{items}
				</Pagination>
			</React.Fragment>
		)
	}
}

class ChapterList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			manga: props.manga,
			chapters: null,
			climit: 15,
			cpage: 0,
			chapterRead: null
		};
	}

	//TODO: Generic pagination for API
	componentDidMount() {
		const page = this.state.climit * this.state.cpage;
		API.chapter(
			{
				"manga": this.state.manga.id, 
				"includes": ["scanlation_group", "user"],
				"order[chapter]": "desc",
			}, this.state.climit, page).then(
			(c) => this.setState({chapters: c})
		);
		//TODO: Only if user
		API.readChapters(this.state.manga.id).then((cl) => {
			this.setState({
				chapterRead: cl.data
			})
		});
	}

	//manga_list.tpl.php
	render() {
		const manga = this.state.manga;
		const chapters = this.state.chapters;
		if (chapters == null) {
			return (
				<React.Fragment>
					Loading...
				</React.Fragment>
			)
		}

		const page_switch = (value) => {
			console.log("Set page ", value);
			//TODO: Push history?
			this.setState(
				{cpage: value}
			, () => {
				this.componentDidMount();
			});
		}

		const is_read = (chapter) => {
			const user = this.props.user;
			const chapterRead = this.state.chapterRead;

			if (user == null || chapterRead == null) {
				return (
					<span className="grey" title="You need to follow this title to mark it read.">
						{display_fa_icon("eye")}
					</span>
				)
			}

			if (chapterRead.includes(chapter.id)) {
				return (
					<span className="clickable" title="Mark as unread" onClick={(e) => {
						API.unreadChapter(chapter.id);

						const arr = this.state.chapterRead;

						this.setState({
							chapterRead: arr.filter((c) => c != chapter.id)
						})
					}}>
						{display_fa_icon("eye-slash")}
					</span>
				)
			} else {
				return (
					<span className="clickable" title="Mark as read" onClick={(e) => {
						API.readChapter(chapter.id);

						const arr = this.state.chapterRead;
						arr.push(chapter.id);

						this.setState({
							chapterRead: arr
						});
					}}>
						{display_fa_icon("eye")}
					</span>
				)
			}
		}

		return (
			<div className="chapter-container" style={{ padding: "0" }}>
				<Row className="no-gutters">
					{(manga == null) ? (
						<React.Fragment>
							<Col md="3" className="d-none d-md-flex no-gutters flex-nowrap align-items-center p-2 border-bottom">
								{display_fa_icon("book", "Title")}
							</Col>
							<div className="w-100 d-md-none"></div>
						</React.Fragment>
					) : (<div></div>)}
					<Col className={manga == null ? "col-md-9" : ""}>
						<Row className="chapter-row d-flex no-gutters p-2 align-items-center border-bottom odd-row">
							<Col className="col-auto text-center " style={{flex: "0 0 2.5em"}}>
								{display_fa_icon("eye", "Read")}
							</Col>
							<Col lg="5" sm="3" className="row no-gutters pr-1">
								{display_fa_icon("file", "Chapter", "", "far")}
							</Col>
							{/*<Col className="col text-right " style={{flex: "0 0 3em"}}>
								{display_fa_icon("comments", "Comments")}
							</Col>*/}
							<div className="w-100 d-lg-none"></div>
							<Col className="col-auto text-center " style={{flex: "0 0 2.5em"}}>
								{display_fa_icon("globe", "Language")}
							</Col>
							<Col className="col ">
								{display_fa_icon("users", "Group")}
							</Col>
							<Col lg="1" className="col-auto text-right mx-1 ">
								{display_fa_icon("user", "Uploader")}
							</Col>
							<Col lg="1" className="col-2 text-right text-info ">
								{display_fa_icon("eye", "Views")}
							</Col>
							<Col lg="1" className="col-2 ml-1 text-right ">
								{display_fa_icon("clock", "Age", "", "far")}
							</Col>
						</Row>
					</Col>
				</Row>
				{chapters.data.map((c) => {
					//TODO: Group by volume-chapter-group etc.
					return (<Row className="no-gutters">
						{/* If latest then display_manga_link_v2 (see chapters.tpl.php) */}
						<Col className={manga == null ? "col-md-9 pmm-0" : "pmm-0"}>
							<Row className="chapter-row d-flex no-gutters pm-2 align-items-center border-bottom odd-row">
								<Col className="col-auto text-center " style={{flex: "0 0 2.5em"}}>
									{is_read(c)}
								</Col>
								<Col lg="5" sm="3" className="row no-gutters pr-1" style={{
									display: "flex",
									flexWrap: "nowrap"
								}}>
									<Link to={c.getUrl()} className="text-truncate" style={{
										width: "unset"
									}}>
										{false && display_fa_icon('file', '', '', 'far')}
										{c.getTitle()}
									</Link>
									{false && <span class="badge badge-primary mx-1">END</span>}
									{!c.isAvailable() && display_fa_icon('file-excel', 'Unavailable', 'mx-1 iconfix', 'fas')}
								</Col>
								{/*<Col className="col text-right " style={{flex: "0 0 3em"}}>
									N/A
								</Col>*/}
								<div className="w-100 d-lg-none"></div>
								<Col className="col-auto text-center " style={{flex: "0 0 2.5em"}}>
									{display_lang_flag_v3(c.getLang())}
								</Col>

								<Col className="text-truncate">
									{display_group_link_v2(c.GetRelationship("scanlation_group"))}
								</Col>

								<Col lg="1" className="col-auto text-right mx-1 text-truncate">
									{display_user_link_v2(c.GetRelationship("user")[0])}
								</Col>
								<Col lg="1" className="col-2 text-right text-info ">
									<span className="d-none d-md-inline d-lg-none d-xl-inline">N/A</span>
									<span className="d-inline d-md-none d-lg-inline d-xl-none" title="N/A">N/A</span>
								</Col>
								<Col lg="1" className="col-3 text-right text-truncate">
									{c.getUpdateDiff()} ago
								</Col>
							</Row>
						</Col>
					</Row>
					)
				})}
				<DPagination pages={Math.ceil(this.state.chapters.total / this.state.climit)} sizeof={this.state.climit} callback={page_switch}/>
			</div>) 
	}
}

class MangaDisplayCovers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			manga: props.manga,
			covers : []
		};
	}

	componentDidMount() {
		API.cover(this.state.manga,{
			"manga": [this.state.manga.id],
			"includes": ["user"]
		}, 100, 0).then((cs) => {
			this.setState({
				covers: cs.data
			});
		});
		//TODO: Carousel with modal
	}

	render() {
		return (
			<React.Fragment>
				<Row>
					{this.state.covers.map((c) => {
						return (
							<div id={`volume_${c.attributes.volume}`} className="col-6 col-md-4 col-lg-3 col-xl-2 px-2 pt-3">
								<a href={c.getCover()} target="_blank" data-lightbox={this.state.manga.getTitle()} data-title={c.getTitle()}>
									<img loading="lazy" className="rounded" width="100%" src={c.getCover256()} title={c.getTitle()} alt={`Volume ${c.attributes.volume}`} />
								</a>
							</div>
						)
					})}
				</Row>
			</React.Fragment>
		)
	}
}

class FollowButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isFollowed: null
		}
	}

	static contextType = UserContext;

	componentDidMount() {
		const { user, setUser } = this.context;

		//TODO: This doesn't always fire?
		if (user != null) {
			API.followsManga(this.props.id).then((r) => {
				if (this.state.isFollowed != r) {
					this.setState({
						isFollowed: r
					});
				}
			})
		}
	}

	render() {
		const { user, setUser } = this.context;

		if (user == null || this.state.isFollowed == null) {
			return (
				<button 
					className='btn btn-secondary' 
					disabled 
					title='You need to log in to use this function.'
				>
					{display_fa_icon('bookmark', 'Follow')} 
					<span>Follow</span>
				</button>
			)
		}

		return (
			<div className='btn-group'>
				{this.state.isFollowed ? (
					<button 
						type='button' 
						className='btn btn-primary'
						onClick={(e) => {
							API.unfollowManga(this.props.id).then((r) => {
								if (r) {
									this.setState({
										isFollowed: false
									});
								}
							})
						}}
						> 
						{display_fa_icon("bookmark")}
						<span>Unfollow</span>
					</button>
				) : (
					<button
						type='button' 
						className='btn btn-secondary manga_follow_button'
						onClick={(e) => {
							API.followManga(this.props.id).then((r) => {
								if (r) {
									this.setState({
										isFollowed: true
									});
								}
							})
						}}
					>
						{display_fa_icon('bookmark')}
						<span>Follow</span>
					</button>
				)}

				{/*i dont know what this does, except that its a dropdown <div class='dropdown-menu dropdown-menu-right'>
				{!this.state.isFollowed ? <a class='dropdown-item manga_unfollow_button' id='$manga_id' data-manga-id='$manga_id' href='#'>" . display_fa_icon('bookmark', 'Unfollow') . " Unfollow</a>" : '');
					foreach ($follow_types as $type) {
						$disabled = (isset($array_of_manga_ids[$manga_id]) && $array_of_manga_ids[$manga_id]['follow_type'] == $type->type_id) ? "disabled" : "";
						$return .= "<a class='$disabled dropdown-item manga_follow_button' data-manga-id='$manga_id' id='$type->type_id' href='#'>" . display_fa_icon($type->type_glyph, 'Follow') . " $type->type_name</a>";
					}
				}
				</div>*/}
			</div>
		)
	}
}

export class MangaDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangaId: props.id,
			manga: null
		};
	}

	static contextType = UserContext;

	componentDidMount() {
		//Can include related manga for some reason
		API.manga({"ids": [this.state.mangaId], "includes": ["cover_art", "author", "artist"]}, true).then(
			(m) => {
				this.setState({
					manga: m.data[0]
				})
				document.title = `${m.data[0].getTitle()}`;
			}
		);
	}

	render() {
		const manga = this.state.manga;
		const user = this.context;

		if (manga == null) {
			return (
				<React.Fragment>
					Loading...
				</React.Fragment>
			)
		}

		//TODO: Move into api?
		const getAverage = () => {
			if (manga.statistics.rating.average == null) {
				return "N/A"
			}
			return manga.statistics.rating.average.toFixed(2)
		}
		const getBayes = () => {
			if (manga.statistics.rating.bayesian == null) {
				return "N/A"
			}
			return manga.statistics.rating.bayesian.toFixed(2)
		}

		return (
			<React.Fragment>
				<Card className="mb-3" style={{padding: "0"}}>
					<h6 className="card-header d-flex align-items-center py-2">
						{display_fa_icon("book")}
						<span className="mx-1">{manga.getTitle()}</span>
						{display_lang_flag_v3(manga.attributes.originalLanguage)}
						{display_labels(manga.isHentai())}
						{/*display_rss_link($templateVar["user"], "manga_id", $templateVar["manga"]->manga_id)*/}
					</h6>
					<div className="card-body p-0">
						<div className="row edit">
							<div className="col-xl-3 col-lg-4 col-md-5">
								<Link to={"#"} title="See covers">
									<img className="rounded" width="100%" src={manga.getCover512()} />
								</Link>
							</div>
							<div className="col-xl-9 col-lg-8 col-md-7">
								<div className="row m-0 py-1 px-0">
									<div className="col-lg-3 col-xl-2 strong">Title ID:</div>
									<div className="col-lg-9 col-xl-10">{display_fa_icon("hashtag")} {manga.id}</div>
								</div>

								{(manga.attributes.altTitles.length > 0) && (
									<div className="row m-0 py-1 px-0 border-top">
										<div className="col-lg-3 col-xl-2 strong">Alt name(s):</div>
										<div className="col-lg-9 col-xl-10">
											<ul className="list-inline m-0">
												{manga.attributes.altTitles.map((key, value) => {
													//TODO: Object.keys
													return <li className="list-inline-item">{display_fa_icon("book")} {Object.values(key)[0]}</li>
												})}
											</ul>
										</div>
									</div>
								)}

								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Author:</div>
									<div className="col-lg-9 col-xl-10">
										{manga.GetRelationship("author") != null && manga.GetRelationship("author").map((a) => {
											return (<a href={a.getUrl()} title="Other manga by this author">{display_fa_icon("external-link-alt")} {a.attributes.name}</a>)
										})}
									</div>
								</div>

								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Artist:</div>
									<div className="col-lg-9 col-xl-10">
										{manga.GetRelationship("artist") != null && manga.GetRelationship("artist").map((a) => {
											return (<a href={a.getUrl()} title="Other manga by this artist">{display_fa_icon("external-link-alt")} {a.attributes.name}</a>)
										})}
									</div>
								</div>

								{(manga.attributes.publicationDemographic != null) && (
									<div className="row m-0 py-1 px-0 border-top">
										<div className="col-lg-3 col-xl-2 strong">Demographic:</div>
										<div className="col-lg-9 col-xl-10">
											<Link to={`/search?demo_id=${manga.attributes.publicationDemographic}`}>
												<Badge bg="secondary" title={`Search for ${manga.attributes.publicationDemographic} titles`}>
													{manga.attributes.publicationDemographic}
												</Badge>
											</Link>
										</div>
									</div>
								)}

								{["format","genre","theme"].map((t) => {
									return (
										<div className="row m-0 py-1 px-0 border-top">
											<div className="col-lg-3 col-xl-2 strong">{capitalizeFirstLetter(t)}: </div>
											<div className="col-lg-9 col-xl-10">
												{manga.attributes.tags.filter((k,v) => k.attributes.group == t).map((k,v) => {
													const genreName = Object.values(k.attributes.name)[0];
													const genreLink = "/genre/" + k.id + "/" + slugify(genreName);
													return (
														<Link to={genreLink}>
															<Badge bg="secondary">{genreName}</Badge>
														</Link>
													)
												})}
											</div>
										</div>
									)
								})}

								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Rating:</div>
									<div className="col-lg-9 col-xl-10">
										<ul className="list-inline m-0">
											<li className="list-inline-item"><span className="text-primary">{display_fa_icon("star", "Bayesian rating")} {getBayes()}</span> </li>
											<li className="list-inline-item small">{display_fa_icon("star", "Mean rating")} {getAverage()}</li>
											<li className="list-inline-item small">{display_fa_icon("user", "Users")} N/A</li>
											<li className="list-inline-item"><button type="button" className="btn btn-secondary btn-xs" id="histogram_toggle">{display_fa_icon("chart-bar")}</button></li>
										</ul>
										{/*<div id="histogram_div" className="display-none"><canvas id="ratings_histogram" data-json="json_encode($templateVar["manga"]->get_user_ratings())"></canvas></div>*/}
									</div>
								</div>

								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Pub. status:</div>
									<div className="col-lg-9 col-xl-10">{manga.attributes.status}</div>
								</div>

								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Stats:</div>
									<div className="col-lg-9 col-xl-10">
										<ul className="list-inline m-0">
											<li className="list-inline-item text-info">{display_fa_icon("eye", "Views")} N/A</li>
											<li className="list-inline-item text-success">{display_fa_icon("bookmark", "Follows")} {manga.statistics.follows}</li>
											<li className="list-inline-item">{display_fa_icon("file", "Total chapters", "", "far")} N/A</li>
										</ul>
									</div>
								</div>

								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Description:</div>
									<div className="col-lg-9 col-xl-10">{manga.getDesc()}</div>
								</div>
								{/*
								display_manga_relations($manga_relations)
								display_manga_ext_links($links_array)
								*/}

								{/*<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Reading progress:</div>
									<div className="reading_progress col-lg-9 col-xl-10">
										<ul className="list-inline m-0">
											<li className="list-inline-item">
												Volume <span id="current_volume">0</span>/NA
												<button disabled title="You need to follow this title to use this function." type="button" className="btn btn-success btn-xs ml-1" id="increment_volume" data-title-id="$templateVar[manga]->manga_id">{display_fa_icon("plus-circle")}</button>
											</li>
											<li className="list-inline-item">
												Chapter <span id="current_chapter">0</span>/NA
												<button disabled title="You need to follow this title to use this function." type="button" className="btn btn-success btn-xs ml-1" id="increment_chapter" data-title-id="$templateVar[manga]->manga_id">{display_fa_icon("plus-circle")}</button>
											</li>
											<li className="list-inline-item"><button disabled title="You need to follow this title to use this function." type="button" className="btn btn-info btn-xs ml-1" id="edit_progress">{display_fa_icon("pencil-alt")}</button></li>
										</ul>
									</div>
									<div className="reading_progress display-none col-lg-9 col-xl-10">
										<form className="form-inline" id="edit_progress_form" method="post" data-title-id="$templateVar["manga"]->manga_id">
											<ul className="list-inline m-0">
												<li className="list-inline-item"><input style={{"width": "60px"}} type="text" className="form-control" id="volume" name="volume" value="$followed_manga_ids_array[$templateVar["manga"]->manga_id]["volume"] ?? """ />0/NA</li>
												<li className="list-inline-item"><input style={{"width": "60px"}} type="text" className="form-control" id="chapter" name="chapter" value="$followed_manga_ids_array[$templateVar["manga"]->manga_id]["chapter"] ?? """ />0/NA</li>
												<li className="list-inline-item"><button type="submit" className="btn btn-success" id="edit_progress_button">{display_fa_icon("save")}</button></li>
												<li className="list-inline-item"><button type="button" className="btn btn-warning" id="cancel_edit_progress">{display_fa_icon("undo")}</button></li>
											</ul>
										</form>
									</div>
								</div>*/}
				
								{/*<?php if (validate_level($templateVar["user"], "gmod") && $templateVar["manga"]->manga_mod_notes) {
								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Mod notes:</div>
									<div className="col-lg-9 col-xl-10" style="color: orangered"><?php $templateVar["parser"]->parse($templateVar["manga"]->manga_mod_notes); print nl2br($templateVar["parser"]->getAsHtml());</div>
								</div>
								<?php */}
				
								<div className="row m-0 py-1 px-0 border-top">
									<div className="col-lg-3 col-xl-2 strong">Actions:</div>
									<div className="col-lg-9 col-xl-10">
										{/*display_upload_button($templateVar["user"])*/}
										{/*display_follow_button($templateVar["user"], $followed_manga_ids_array, $templateVar["manga"]->manga_id)*/}
										<FollowButton id={manga.getId()}/>
										{/*display_manga_rating_button($templateVar["user"]->user_id, $templateVar["manga"]->get_user_rating($templateVar["user"]->user_id), $templateVar["manga"]->manga_id)*/}
										{/*display_edit_manga($templateVar["user"], $templateVar["manga"])*/}
										{/*<?php if (validate_level($templateVar["user"], "member")) :
											<button type="button" className="btn btn-warning float-right mr-1" data-toggle="modal" data-target="#manga_report_modal">display_fa_icon("flag") <span className="d-none d-xl-inline">Report</span></button>
										<?php else :
											<button type="button" title="You must be logged in to send a report" className="btn btn-warning float-right mr-1" disabled>display_fa_icon("flag") <span className="d-none d-xl-inline">Report</span></button>
										<?php endif;*/}
										<button type="button" title="You must be logged in to send a report" className="btn btn-warning float-right mr-1" disabled>{display_fa_icon("flag")} <span className="d-none d-xl-inline">Report</span></button>
									</div>
								</div>
							</div>
						</div>
				
					</div>
				</Card>
				
				<Tabs
					defaultActiveKey="chapters"
					className="mb-2"
					selectedIndex={0}
				>
					<Tab eventKey="chapters" title={<span>{display_fa_icon("file", "", "", "far")} Chapters</span>}>
						<Row className="m-0">
							<ChapterList manga={manga} user={user}/>
						</Row>
					</Tab>
					<Tab eventKey="covers" title={<span>{display_fa_icon("image")} Covers</span>}>
						<Row className="m-0">
							<MangaDisplayCovers manga={manga} />
						</Row>
					</Tab>
				</Tabs>
			</React.Fragment>
		)
	}
}