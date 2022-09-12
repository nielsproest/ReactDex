import React from "react";
import Row from "react-bootstrap/Row";
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';


import {
	Link
} from "react-router-dom";

import { 
	display_lang_flag_v3, 
	display_fa_icon, 
	display_count_comments, 
	display_genres_checkboxes 
} from "./partials"

import { DPagination, FollowButton } from "./Manga";

import API from "./MangaDexAPI/API";
import { capitalizeFirstLetter } from "./utility";

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
		return (
			<Row className="mt-1 mx-0">
				{this.props.mangas.map((manga) => {
					return (
						<div className="manga-entry col-lg-6 border-bottom pl-0 my-1">
							<div className="rounded large_logo mr-2">
								<Link to={manga.getUrl()}>
									<img 
										className="rounded"
										src={manga.getCover512()}
										width="100%"
										alt="image"
									/>
								</Link>
							</div>

							<div className="text-truncate mb-1 d-flex flex-nowrap align-items-center">
								{display_lang_flag_v3("en", true)}
								<Link 
									className="ml-1 manga_title text-truncate" 
									title={manga.getTitle()}
									to={manga.getUrl()}
								>
									{manga.getTitle()}
								</Link>
								{manga.isHentai() && (
									<div>
										<Badge bg="danger" className="ml-1">H</Badge>
									</div>
								)}
							</div>
			
							<ul className="list-inline m-1">
								<li className="list-inline-item text-primary">
									{display_fa_icon('star', 'Bayesian rating')}
									&nbsp;
									{/*<span title='You have not rated this title.'>--</span>*/}
									<span title="N/A votes">{manga.getBayes()}</span>
								</li>
								<li className="list-inline-item text-success">
									{display_fa_icon('bookmark', 'Follows')}
									&nbsp;
									{manga.getFollows()}
								</li>
								<li className="list-inline-item text-info manga_views">
									{display_fa_icon('eye', 'Views')}
									&nbsp;
									N/A
								</li>
								<li className="list-inline-item">
									{display_count_comments(0, 'manga', manga)}
								</li>
								<li className="list-inline-item float-right">
									{/*
									<?php if (isset($templateVar['list_user_followed_manga_ids_array']) && $templateVar['list_user']->user_id != $templateVar['user']->user_id) {}
										<button title="{$follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_name}"
												className="disabled btn btn-xs btn-{$follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_class}">{display_fa_icon($follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_glyph)}</button>
									<?php }}
									{display_follow_button($templateVar['user'], $followed_manga_ids_array, $manga->manga_id, 1)}
									*/}
									{/*<FollowButton id={manga.getId()} style={true}/>*/}
								</li>
							</ul>
			
							<div style={{height: "210px", overflow: "hidden"}}>
								{/*nl2br($templateVar['parser']->getAsHtml())*/}
							</div>
						</div>
					)
				})}
			</Row>
		) 
	}
}
class MangaUIExpandedList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}
	render() { 
		return (
			<React.Fragment>
				<div className="border-bottom">
					<div style={{width: "80px"}} className="rounded my-2 mr-0 float-left"></div>
					<div className="row m-0">
						<div className="d-none d-md-block col-md-5 col-lg-7">
							<div className="row">
								<div className="p-1 col text-truncate">
									{display_fa_icon('globe', 'Language')}
									{display_fa_icon('book', 'Title')}
									{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_name", "alpha", $templateVar['base_url'])*/}
								</div>
								<div className="p-1 d-none d-md-block col text-truncate">
									{display_fa_icon('pencil-alt', 'Author/Artist')}
								</div>
								<div className="p-1 col-auto col-md-2 text-center"></div>
							</div>
						</div>
						<div className="col-md-7 col-lg-5">
							<div className="row">
								<div className="p-1 col">
									{display_fa_icon('comments', 'Comments')}
									{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_comments", "numeric", $templateVar['base_url'])*/}
								</div>
								<div className="p-1 col text-center text-primary">
									{display_fa_icon('user', 'User rating')}
								</div>
								<div className="p-1 col text-center text-primary">
									{display_fa_icon('star', 'Bayesian rating')} 
									{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_bayesian", "numeric", $templateVar['base_url'])*/}
								</div>
								<div className="p-1 col text-center text-info">
									{display_fa_icon('eye', 'Views')}
									{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_views", "numeric", $templateVar['base_url'])*/}
								</div>
								<div className="p-1 col text-center text-success">
									{display_fa_icon('bookmark', 'Follows')}
									{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_follows", "numeric", $templateVar['base_url'])*/}
								</div>
								<div className="p-1 col text-right">
									{display_fa_icon('sync', 'Last update')}
									{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_last_updated", "numeric", $templateVar['base_url'])*/}
								</div>
							</div>
						</div>
					</div>
				</div>

				{this.props.mangas.map((manga) => {
					var author = manga.GetRelationship("author");
					if (author != null) author = author[0];

					return (
						<div className="manga-entry border-bottom" >
							<div className="w-100">
								<div className="rounded sm_md_logo col-auto p-2 float-left">
									<Link 
										to={manga.getUrl()}>
										<img
											style={{objectFit: "scale-down"}}
											className="rounded"
											src={manga.getCover256()}
											width="100%" 
											alt="image" 
										/>
									</Link>
								</div>
								<div>
									<div className="row m-0 col-auto p-0">
										<div className="col-md-5 col-lg-7 p-0">
											<div className="row m-0">
												<div className="p-1 col d-flex align-items-center text-truncate flex-nowrap">
													{display_lang_flag_v3("en", true)}
													<Link 
														title={manga.getTitle()}
														to={manga.getUrl()}
														className="ml-1 manga_title text-truncate"
													>
														{manga.getTitle()}
													</Link>
													{manga.isHentai() && (
														<div>
															<Badge bg="danger" className="ml-1">H</Badge>
														</div>
													)}
												</div>
												<div className="p-1 d-none d-lg-block col text-truncate">
													{author != null && (
														<Link 
															title={author.getName()}
															to={author.getUrl()}
														>
															{author.getName()}
														</Link>
													)}
												</div>
												<div className="p-1 col-auto col-md-2 text-center">
													{/*
													<?php if (isset($templateVar['list_user_followed_manga_ids_array']) && $templateVar['list_user']->user_id != $templateVar['user']->user_id) { ?>
														<button title="<?= $follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_name ?>"
																className="disabled btn btn-xs btn-<?= $follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_class ?>"><?= display_fa_icon($follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_glyph) ?></button>
													<?php } ?>
													<?= display_follow_button($templateVar['user'], $followed_manga_ids_array, $manga->manga_id, 1) ?>
													*/}
													{/*<FollowButton id={manga.getId()} style={true}/>*/}
												</div>
											</div>
										</div>
										<div className="col-md-7 col-lg-5">
											<div className="row">
												<div className="p-1 col">
													{display_count_comments(0, 'manga', manga)}
												</div>
												<div className="p-1 col text-center text-primary">
													{/*<?php
														if (isset($templateVar['list_user_manga_ratings_array'])) {
															if (isset($templateVar['list_user_manga_ratings_array'][$manga->manga_id]))
																print "<button style='width: 22px;' disabled className='btn btn-primary btn-xs' title=\"{$templateVar['list_user']->username}'s rating\">{$templateVar['list_user_manga_ratings_array'][$manga->manga_id]}</button>";
															else
																print "<button style='width: 22px;' disabled className='btn btn-primary btn-xs' title='Not yet rated by {$templateVar['list_user']->username}'>-</button>";
														} else {
															if (isset($user_manga_ratings_array[$manga->manga_id]))
																print display_manga_rating_button($templateVar['user']->user_id, $user_manga_ratings_array[$manga->manga_id], $manga->manga_id, 1);
															else
																print display_manga_rating_button($templateVar['user']->user_id, 0, $manga->manga_id, 1);
														}
													?>*/}
													N/A
												</div>
												<div className="p-1 col text-center text-primary">
													<span title="N/A votes">
														{manga.getBayes()}
													</span>
												</div>
												<div className="p-1 col text-center text-info manga_views">N/A</div>
												<div className="p-1 col text-center text-success">{manga.getFollows()}</div>
												<div className="p-1 col text-right">
													<time datetime="">
														{/*manga_last_updated*/}
														Jan-1
													</time>
												</div>
											</div>
										</div>
									</div>
									{/*
									<div className="pl-1" style={{overflow: "hidden", height: "125px"}}>
										<?= $templateVar['parser']->getAsHtml() ?>
									</div>
									*/}
								</div>
							</div>
						</div>
					)
				})}
			</React.Fragment>
		) 
	}
}
class MangaUISimpleList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}
	render() { 
		return (
			<React.Fragment>
				<div className="row m-0 border-bottom">
					<div className="d-none d-md-block col-md-6 col-lg-7">
						<div className="row">
							<div className="p-1 col text-truncate">
								{display_fa_icon('globe', 'Language')}
								{display_fa_icon('book', 'Title')}
								{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_name", "alpha", $templateVar['base_url'])*/}
							</div>
							<div className="p-1 d-none d-lg-block col-3 text-truncate">
								{display_fa_icon('pencil-alt', 'Author/Artist')}
							</div>
							<div className="p-1 col-auto col-md-2 text-center"></div>
						</div>
					</div>
					<div className="col-md-6 col-lg-5">
						<div className="row">
							<div className="p-1 col">
								{display_fa_icon('comments', 'Comments')}
								{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_comments", "numeric", $templateVar['base_url'])*/}
							</div>
							<div className="p-1 col text-center text-primary">
								{display_fa_icon('user', 'User rating')}
							</div>
							<div className="p-1 col text-center text-primary">
								{display_fa_icon('star', 'Bayesian rating')}
								{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_rating", "numeric", $templateVar['base_url'])*/}
							</div>
							<div className="p-1 col text-center text-info">
								{display_fa_icon('eye', 'Views')}
								{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_views", "numeric", $templateVar['base_url'])*/}
							</div>
							<div className="p-1 col text-center text-success">
								{display_fa_icon('bookmark', 'Follows')}
								{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_follows", "numeric", $templateVar['base_url'])*/}
							</div>
							<div className="p-1 col text-right">
								{display_fa_icon('sync', 'Last update')}
								{/*display_sort($templateVar['page'], $templateVar['search'], $templateVar['sort'], "manga_last_updated", "numeric", $templateVar['base_url'])*/}
							</div>
						</div>
					</div>
				</div>

				{this.props.mangas.map((manga) => {
					var author = manga.GetRelationship("author");
					if (author != null) author = author[0];
					//rank++

					return (
						<div className="manga-entry row m-0 border-bottom">
							<div className="col-md-6 col-lg-7">
								<div className="row">
									<div className="p-1 col text-truncate d-flex flex-nowrap align-items-center">
										{/*<?php if ($templateVar['page'] == 'titles' && in_array($templateVar['sort'], [5, 7, 9, 11])) print "<span className='badge badge-info mr-1'>$rank</span>"; ?>*/}
										{display_lang_flag_v3("en", true)}
										<Link 
											title={manga.getTitle()}
											to={manga.getUrl()}
											className="ml-1 manga_title text-truncate"
										>
											{manga.getTitle()}
										</Link>
										{manga.isHentai() && (
											<Badge bg="danger" className="ml-1">H</Badge>
										)}
									</div>
									<div className="p-1 d-none d-lg-block col-3 text-truncate">
										{author != null && (
											<Link 
												title={author.getName()}
												to={author.getUrl()}
											>
												{author.getName()}
											</Link>
										)}
									</div>
									<div className="p-1 col-auto col-md-2 text-center">
										{/*
										<?php if (isset($templateVar['list_user_followed_manga_ids_array']) && $templateVar['list_user']->user_id != $templateVar['user']->user_id) { ?>
											<button title="<?= $follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_name ?>"
													className="disabled btn btn-xs btn-<?= $follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_class ?>"><?= display_fa_icon($follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_glyph) ?></button>
										<?php } ?>
										display_follow_button($templateVar['user'], $followed_manga_ids_array, $manga->manga_id, 1)
										*/}
										{/*<FollowButton id={manga.getId()} style={true}/>*/}
									</div>
								</div>
							</div>
							<div className="col-md-6 col-lg-5">
								<div className="row">
									<div className="p-1 col">
										{display_count_comments(0, 'manga', manga)}
									</div>
									<div className="p-1 col text-center text-primary">
										{/*
										<?php
										if (isset($templateVar['list_user_manga_ratings_array'])) {
											if (isset($templateVar['list_user_manga_ratings_array'][$manga->manga_id]))
												print "<button style='width: 22px;' disabled className='btn btn-primary btn-xs' title=\"{$templateVar['list_user']->username}'s rating\">{$templateVar['list_user_manga_ratings_array'][$manga->manga_id]}</button>";
											else
												print "<button style='width: 22px;' disabled className='btn btn-primary btn-xs' title='Not yet rated by {$templateVar['list_user']->username}'>-</button>";
										} else {
											if (isset($user_manga_ratings_array[$manga->manga_id]))
												print display_manga_rating_button($templateVar['user']->user_id, $user_manga_ratings_array[$manga->manga_id], $manga->manga_id, 1);
											else
												print display_manga_rating_button($templateVar['user']->user_id, 0, $manga->manga_id, 1);
										}
										?>
										*/}
										N/A
									</div>
									<div className="p-1 col text-center text-primary">
										<span title="N/A votes">
											{manga.getBayes()}
										</span>
									</div>
									<div className="p-1 col text-center text-info manga_views">N/A</div>
									<div className="p-1 col text-center text-success">{manga.getFollows()}</div>
									<div className="p-1 col text-right">
										<time datetime="">
											{/*manga_last_updated*/}
											Jan-1
										</time>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</React.Fragment>
		) 
	}
}
class MangaUIGrid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	render() { 
		return (
			<React.Fragment>
				{this.props.mangas.map((manga) => {
					return (
						<div className="manga-entry large_logo rounded position-relative mx-1 my-2">
							<div className="hover">
								<Link to={manga.getUrl()}>
									<img 
										width="100%"
										title={manga.getTitle()}
										className="rounded"
										src={manga.getCover512()}
									/>
								</Link>
							</div>
							<div className={`${manga.isHentai() ? 'car-caption-h' : 'car-caption'} px-2 py-1`}>
								<p className="text-truncate m-0">
									{display_lang_flag_v3("en")}
									<Link 
										title={manga.getTitle()}
										to={manga.getUrl()}
										className="white ml-1 manga_title text-truncate"
									>
										{manga.getTitle()}
									</Link>
								</p>
								{/*
								<?php if (isset($templateVar['list_user_followed_manga_ids_array']) && $templateVar['list_user']->user_id != $templateVar['user']->user_id) { ?>
									<div className="float-left">
									<button title="<?= $follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_name ?>"
											className="disabled btn btn-xs btn-<?= $follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_class ?>"><?= display_fa_icon($follow_types->{$templateVar['list_user_followed_manga_ids_array'][$manga->manga_id]}->type_glyph) ?></button>
									</div>
								<?php } ?>
								*/}
								<div className="float-right">
									{/*<FollowButton id={manga.getId()} style={true} dropup={true}/>*/}
								</div>
							</div>
						</div>
					)
				})}
				<div className="clearfix mb-3"></div>
			</React.Fragment>
		) 
	}
}

export class SearchUI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangas: [],
			mode: 0,
			mtotal: 0,
			mlimit: 32,
			moffset: 0
		}

		/*
		console.log("SearchUI", props.search);
		*/
	}

	componentDidUpdate(prevProps) {
		//TODO: Search updated, call componentDidMount if diff props
	}

	componentDidMount() {
		var search_dict = {
			"includes": ["cover_art", "author", "artist"]
		}

		console.log(this.props);
		if (this.props.title != null) {
			Object.assign(search_dict, {"title": this.props.title});
		}
		if (this.props.rating != null) {
			Object.assign(search_dict, {"contentRating": this.props.rating});
		}
		if (this.props.tag != null) {
			Object.assign(search_dict, {"includedTags": this.props.tag});
		}
		//TODO: Exclusion mode
		//TODO: Sort mode

		API.manga(
			search_dict, 
			true, 
			this.state.mlimit, 
			this.state.moffset 
		).then((ms) => {
			/*console.log(ms);*/
			this.setState({
				mangas: ms.data,
				mtotal: ms.total,
				moffset: ms.offset
			});
		});
		API.tags().then((t) => {
			this.setState({
				tags: t.data
			});
		});
	}

	/*
	Title modes:
	0: Detailed
	1: Expanded list
	2: Simple list
	3: Grid
	*/
	getRenderer() {
		if (this.state.mode == 1) {
			return (
				<MangaUIExpandedList user={this.props.user} mangas={this.state.mangas}/>
			)
		} else if (this.state.mode == 2) {
			return (
				<MangaUISimpleList user={this.props.user} mangas={this.state.mangas}/>
			)
		} else if (this.state.mode == 3) {
			return (
				<MangaUIGrid user={this.props.user} mangas={this.state.mangas}/>
			)
		} else {
			return (
				<MangaUIDetailed user={this.props.user} mangas={this.state.mangas}/>
			)
		}
	}
	setRenderer(idx) {
		this.setState({
			mode: idx
		});
	}


	viewMode() {
		const type = this.state.mode;
		return ['th-large', 'th-list', 'bars', 'th'][type];
	}
	viewIsActive(idx) {
		return this.state.mode == idx;
	}

	searchHeader() { 
		const tags = this.state.tags != null ? this.state.tags : [];
		const genre_tags = tags.filter((t) => t.attributes.group == "genre");
		const theme_tags = tags.filter((t) => t.attributes.group == "theme");
		const format_tags = tags.filter((t) => t.attributes.group == "format");
		const content_tags = tags.filter((t) => t.attributes.group == "content");

		const grouped_tags = {
			"Genre": genre_tags,
			"Theme": theme_tags,
			"Format": format_tags,
			"Content": content_tags
		}

		/*console.log("Genre", genre_tags);
		console.log("Theme", theme_tags);
		console.log("Format", format_tags);
		console.log("Content", content_tags);*/
		console.log(grouped_tags);

		return (
			<React.Fragment>
				<Nav variant="tabs">
					{/*
					<li className="nav-item" title="Manga titles" ><a className="nav-link" href="/titles"><?= display_fa_icon('book', 'Manga titles') ?> <span className="d-none d-sm-inline">Titles</span></a></li>
					<li className="nav-item" title="Advanced search"><a className="nav-link <?= display_active($_GET['page'], ['search']) ?>" href="/search"><?= display_fa_icon('search', 'Advanced search') ?> <span className="d-none d-sm-inline">Search</span></a></li>
					<li className="nav-item" title="Spring 2018"><a className="nav-link" href="/featured"><?= display_fa_icon('tv', 'Featured') ?> <span className="d-none d-sm-inline">Featured</span></a></li>
					<li className="nav-item" title="Add manga title"><a className="nav-link" href="/manga_new"><?= display_fa_icon('plus-circle', 'Add manga title') ?> <span className="d-none d-sm-inline">Add</span></a></li>
					*/}

					<Dropdown as={NavItem} onSelect={(i) => {
						this.setRenderer(i);
					}}>
						<Dropdown.Toggle as={NavLink}>
							{display_fa_icon(this.viewMode())}
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item eventKey={0} active={this.viewIsActive(0)}>
								{display_fa_icon('th-large')} Detailed
							</Dropdown.Item>
							<Dropdown.Item eventKey={1} active={this.viewIsActive(1)}>
								{display_fa_icon('th-list')} Expanded list
							</Dropdown.Item>
							<Dropdown.Item eventKey={2} active={this.viewIsActive(2)}>
								{display_fa_icon('bars')} Simple list
							</Dropdown.Item>
							<Dropdown.Item eventKey={3} active={this.viewIsActive(3)}>
								{display_fa_icon('th')} Grid
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Nav>

				<div className="card my-3" style={{paddingRight: "0", paddingLeft: "0"}}>
					<h6 className="card-header">{display_fa_icon('search-plus')} Search</h6>
					<div className="card-body">
						<form id="search_titles_form" method="get" action="/search">
							<div className="form-group row">
								<label for="title" className="col-md-3 col-form-label">Manga title</label>
								<div className="col-md-9">
									<input 
										type="text" 
										className="form-control" 
										id="title" 
										name="title" 
										value={this.props.title != null ? this.props.title : ""}
									/>
								</div>
							</div>
							{/*
							<div className="form-group row">
								<label for="author" className="col-md-3 col-form-label">Author</label>
								<div className="col-md-9">
									<input 
										type="text" 
										className="form-control" 
										id="author" 
										name="author" 
										value={""}
									/>
								</div>
							</div>
							<div className="form-group row">
								<label for="artist" className="col-md-3 col-form-label">Artist</label>
								<div className="col-md-9">
									<input 
										type="text" 
										className="form-control" 
										id="artist" 
										name="artist" 
										value={""}
									/>
								</div>
							</div>
							*/}
							<div className="form-group row">
								<label for="lang_id" className="col-md-3 col-form-label">Original language</label>
								<div className="col-md-9">
									<select className="form-control" id="lang_id" name="lang_id">
										{/*
										<option {!isset($_GET['lang_id']) ? "selected" : ""} value="">All languages</option>
										<?php
										foreach (ORIG_LANG_ARRAY as $key => $language) {
											$selected = ($key == ($_GET['lang_id'] ?? '')) ? "selected" : "";
											print "<option $selected value='$key'>$language</option>";
										}
										?>
										*/}
									</select>
								</div>
							</div>
							<div className="form-group row">
								<label for="demo_id" className="col-md-3 col-form-label">Demographic</label>
								<div className="col-md-9">
									<div className="row px-3">
										{/*
										<?php
									foreach (MANGA_DEMO as $key => $demo) {
										$checked = empty($templateVar['demos']) || in_array($key, $templateVar['demos']) ? "checked" : "";
										if ($key) {
											print "
												<div className='custom-control custom-checkbox form-check col-auto' style='min-width:8rem'>
													<input type='checkbox' className='custom-control-input' name='demo_id[]' id='demo_id_$key' $checked value='$key'>
													<label className='custom-control-label' for='demo_id_$key'>$demo</label>
												</div>";
											}
										}
										?>
										*/}
									</div>
								</div>
							</div>
							<div className="form-group row">
								<label for="status_id" className="col-md-3 col-form-label">Publication status</label>
								<div className="col-md-9">
									<div className="row px-3">
										{/*
										<?php
									foreach (STATUS_ARRAY as $key => $status) {
											$checked = empty($templateVar['statuses']) || in_array($key, $templateVar['statuses']) ? "checked" : "";
											if ($key) {
												print "
												<div className='custom-control custom-checkbox form-check col-auto' style='min-width:8rem'>
													<input type='checkbox' className='custom-control-input' name='status_id[]' id='status_id_$key' $checked value='$key'>
													<label className='custom-control-label' for='status_id_$key'>$status</label>
												</div>";
											}
										}
										?>
										*/}
									</div>
								</div>
							</div>
							<div className="form-group row">
								<label for="status_id" className="col-md-3 col-form-label">Content rating</label>
								<div className="col-md-9">
									<div className="row px-3">
										{["safe","suggestive","erotica","pornographic"].map((r,idx) => {
											return (
												<div 
													className='custom-control custom-checkbox form-check col-auto' 
													style={{minWidth: "8rem"}}
												>
													<input 
														type='checkbox' 
														className='custom-control-input' 
														name='rating[]' 
														id={`status_id_${r}`}
														checked={this.props.rating != null && this.props.rating.includes(r)}
														value={r}
													/>
													<label 
														className='custom-control-label' 
														for={`status_id_${r}`}
													>
														<Badge 
															bg={["success","info","warning","danger"][idx]} 
															title={`Search for ${r} rating`} 
														>
															{capitalizeFirstLetter(r)} 
														</Badge>
													</label>
												</div>
											)
										})}
									</div>
								</div>
							</div>
							<div className="form-group row">
								<label className="col-md-3 col-form-label">Tag display mode</label>
								<div className="col-md-9">
									<div className="btn-group">
										<button type="button" className="tag-display-mode-toggle btn btn-secondary" data-value="dropdowns">Dropdowns</button>
										<button type="button" className="tag-display-mode-toggle btn btn-secondary" data-value="checkboxes">Checkboxes</button>
									</div>
								</div>
							</div>
							{/*
							<input type="submit" value="Search" className="d-none" />
							<div className="form-group row mb-0 tag-display-mode-wrapper" data-tag-display="dropdowns">
								<label for="tags_inc" className="col-md-3 col-form-label">Include tags</label>
								<div className="col-md-9 genres-filter-wrapper">
									display_genres_dropdown($grouped_genres->toGroupedArray(), $templateVar['tags_inc'], 'tags_inc')
								</div>
							</div>
							<div className="form-group row mb-0 tag-display-mode-wrapper" data-tag-display="dropdowns">
								<label for="tags_exc" className="col-md-3 col-form-label">Exclude tags</label>
								<div className="col-md-9 genres-filter-wrapper">
									display_genres_dropdown($grouped_genres->toGroupedArray(), !empty($templateVar['tags_exc']) ? $templateVar['tags_exc'] : explode(',', $templateVar['user']->excluded_genres), 'tags_exc')
								</div>
							</div>
							*/}
							<div className="form-group row tag-display-mode-wrapper" data-tag-display="checkboxes">
								<label for="tags_both" className="col-md-3 col-form-label">Include/Exclude tags</label>
								<div className="col-md-9 genres-filter-wrapper pl-4">
									<div className="container">
										{
											display_genres_checkboxes(
												grouped_tags,
												this.props.tag,
												[],
												true,
												true,
												"tags_both[]"
											)
										}
										{/*
										display_genres_checkboxes(
											$grouped_genres->toGroupedArray(), 
											$templateVar['tags_inc'], 
											!empty($templateVar['tags_exc']) ? $templateVar['tags_exc'] : explode(',', $templateVar['user']->excluded_genres), 
											true, 
											false, 
											'tags_both[]'
										)
										*/}
									</div>
								</div>
							</div>
							<div className="form-group row">
								<label className="col-md-3 col-form-label">Tag inclusion mode</label>
								<div className="col-md-9">
									<div className="form-check form-check-inline">
										<input className="form-check-input" type="radio" name="tag_mode_inc" id="tag_mode_inc_all" value="all" />
										{/*$templateVar['tag_mode_inc'] === 'all' ? 'checked' : ''*/}
										<label className="form-check-label" for="tag_mode_inc_all">All <small>(AND)</small></label>
									</div>
									<div className="form-check form-check-inline">
										<input className="form-check-input" type="radio" name="tag_mode_inc" id="tag_mode_inc_any" value="any" />
										{/*$templateVar['tag_mode_inc'] === 'any' ? 'checked' : ''*/}
										<label className="form-check-label" for="tag_mode_inc_any">Any <small>(OR)</small></label>
									</div>
								</div>
							</div>
							<div className="form-group row">
								<label className="col-md-3 col-form-label">Tag exclusion mode</label>
								<div className="col-md-9">
									<div className="form-check form-check-inline">
										<input className="form-check-input" type="radio" name="tag_mode_exc" id="tag_mode_exc_all" value="all" />
										{/*$templateVar['tag_mode_exc'] === 'all' ? 'checked' : ''*/}
										<label className="form-check-label" for="tag_mode_exc_all">All <small>(AND)</small></label>
									</div>
									<div className="form-check form-check-inline">
										<input className="form-check-input" type="radio" name="tag_mode_exc" id="tag_mode_exc_any" value="any" />
										{/*$templateVar['tag_mode_exc'] === 'any' ? 'checked' : ''*/}
										<label className="form-check-label" for="tag_mode_exc_any">Any <small>(OR)</small></label>
									</div>
								</div>
							</div>
							<div className="text-center">
								<button type="submit" className="btn btn-secondary" id="search_button">{display_fa_icon('search')} Search</button>
							</div>
						</form>
					</div>
				</div>
			</React.Fragment>
		) 
	}

	render() {
		const page_switch = (value) => {
			console.log("Set page ", value);
			//TODO: Push history?
			this.setState({
				moffset: value*this.state.mlimit
			}, () => {
				this.componentDidMount();
			});
		}
	
		return (
			<React.Fragment>
				{this.searchHeader()}
				{/*<MangaUIHeaders getRender={() => this.state.mode} setRender={(i) => this.setRenderer(i)} />*/}
				<div id="listing" style={{height: "40px", paddingBottom: "60px"}}>
					<Row className="my-2">
						<div className="col-auto ml-auto">
							Sort by 
							<select 
								className="manga-sort-select form-control d-inline-block w-auto ml-1"
							>
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
					</Row>
				</div>
				{/* If mangas empty, display partials/alert */}
				{this.getRenderer()}
				<DPagination 
					pages={Math.ceil(this.state.mtotal / this.state.mlimit)} 
					sizeof={30} 
					callback={page_switch}
				/>
			</React.Fragment>
		)
	}
}
