import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Alert from "react-bootstrap/Alert";
import ListGroup from 'react-bootstrap/ListGroup';

import React from "react";
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
	display_reading_history
} from "./partials"
import { UserContext } from "./user-context";
import { ElementUpdater, getUUID } from "./utility";
import API from "./MangaDexAPI/API";

export class MangaCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			manga: props.manga,
			id: props.id
		};
	}

	//TODO: placeholder col-7
	//TODO: Loading screen with placeholder

	uploaderDisplay(chap) {
		const group = chap.GetRelationship("scanlation_group");
		if (group != null) {
			return (
				<div className="text-truncate py-0 mb-1">
					<div className='text-truncate ml-1 py-0 mb-1'>{[display_fa_icon('users'), " ", display_group_link_v2(group[0])]}</div>
				</div>
			)
		} else {
			return (
				<div className="text-truncate py-0 mb-1">
					<div className='text-truncate py-0 ml-1 mb-1'>{[display_fa_icon('user'), " ", display_user_link_v2(chap.GetRelationship("user")[0])]}</div>
				</div>
			)
		}
	}

	render() {
		const manga = this.state.manga;
		const chapter = manga.GetRelationship("chapter")[0];
		var has_end_tag = false;

		//TODO: Group by both manga and group
		manga.GetRelationship("chapter").length = Math.min(
			3, 
			manga.GetRelationship("chapter").length
		); //Limit display length

		return (
			<Col md={6} className="col-md-6 border-bottom p-2">
				<div className="hover sm_md_logo rounded float-left mr-2">
					<Link to={manga.getUrl()}>
						<img className="rounded max-width" src={manga.getCover256()} alt="Thumbnail" loading="lazy" />
					</Link>
				</div>
				<div className="pt-0 pb-1 mb-1 border-bottom d-flex align-items-center flex-nowrap">
					<div>{display_fa_icon('book', '', 'mr-1')}</div>
					{display_manga_link_v2(manga)}
				</div>
				{manga.GetRelationship("chapter").map((chap) => {
					return (
						<div key={chap.getId()} className="text-truncate py-0 mb-1 no-gutters align-items-center flex-nowrap">
							{display_fa_icon('file', '', 'mr-1 right5', 'far')}
							{display_short_title(chap, '', 'truncate')}
							{has_end_tag ? (<div className='ml-1'><span className='badge badge-primary'>END</span></div>) : ''}
							{[" ", !chap.isAvailable() ? display_fa_icon('file-excel', 'Unavailable', 'mx-1', 'fas') : '']}
							<div className="ml-1">{display_lang_flag_v3(chap.getLang())}</div>
						</div>
					)
				})}
				{/*TODO: Dont rely on a chapter existing*/}
				{this.uploaderDisplay(chapter)}
				<div className='text-truncate ml-1 py-0 mb-1'>{[
					display_fa_icon('clock', '', '', 'far'), 
					' ', 
					<ElementUpdater delay={1000} func={() => chapter.getUpdateDiff()} />, 
					" ago"
				]}</div>
			</Col>
		)
	}
}

class Announcement {
	timestamp() {
		return "(Feb-29)";
	}
	title() {
		return "Test";
	}
	id() {
		return "0";
	}
}

export class Announcements extends React.Component {
	render() {
		/*display_alert("warning", '', "Warning", "Your account is currently unactivated. Please enter your activation code <a href='/activation'>here</a> for access to all of " . TITLE . "'s features.");*/

		/* <?= $templateVar['user']->user_id ? 'alert-dismissible ' : '' ?> */
		return (
			<Alert show={false} variant="success" dismissible className="fade show text-center" role="alert">
				{[new Announcement()].map((a,idx) => {
					return (
						<div key={a.id()}>
							<strong>Announcement {a.timestamp()}:</strong> {a.title()} <a title="Go to forum thread" href={`/thread/${a.id()}`}>{display_fa_icon('external-link-alt', 'Forum thread')}</a>
							{/* if last */}
							{/* <?= $templateVar['user']->user_id ? 4 : 1.25 =>*/}
							{false && (<hr style="margin-right: -1.25rem; margin-left: -1.25rem;" />)}
						</div>
					)
				})}
			</Alert>
		)
	}
}

export class MangaCards extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangas: [],
			followMangas: null
		};
	}

	static contextType = UserContext;

	followsGet() {
		const { user, setUser } = this.context;

		if (user != null) {
			API.getFollowedManga(30, 0).then(res => {
				this.setState({
					followMangas: res.data
				});
			}).catch((e) => {
				console.log("User not logged in!");
			})
		}
	}
	componentDidMount() {
		API.mangaByChapterUpload(30,0).then(res => {
			console.log("Retrieve succeded!");
			console.log(res);
			this.setState({
				mangas: res.data
			});
		}).catch((e) => {
			console.log("Retrieve failed!");
			console.log(e);
		})
		this.followsGet();
	}
	componentDidUpdate(prevProps) {
		console.log("MangaCards - componentDidUpdate");
		//TODO: Or last update is old?
		if (this.state.followMangas == null) {
			this.followsGet();
		}
	}

	render() {
		//TODO: Seperate function for UserContext
		const follows_render = () => {
			//TODO: This should use ApiContext consumer for login update
			if (this.state.followMangas == null) { //not logged in
				return display_alert("info" ,"m-2 widthfix", "Notice", [
					"Please ",
					display_fa_icon("sign-in-alt"),
					" ",
					<Link to="/login">login</Link>,
					" to see updates from your follows."
				]);
			}

			if (this.state.followMangas.length > 0) {
				return this.state.followMangas.map((i) => {
					//TODO: Why is this a key violation?
					return (<MangaCard manga={i} key={getUUID(i)}/>)
				})
			} else {
				return display_alert("info", "m-2 widthfix", "Notice", "You haven't followed any manga!")
			}
		}

		const renderMangas = () => {
			const mangas = this.state.mangas;
			return mangas.map((i) => {
				//TODO: Why is this a key violation?
				return (<MangaCard manga={i} key={getUUID(i)} />)
			})
		}

		return (
			<Col lg={8}>
				{/*mobile_app_ad*/}
				<ElementUpdater delay={1000 * 60 * 10} func={() => this.componentDidMount()} />
				<Card className="card mb-3">
					<Card.Header className="text-center bg-custom">{display_fa_icon("external-link-alt")} <Link to="/updates">Latest updates</Link></Card.Header>
					<Tabs
						defaultActiveKey="latest_update"
						fill
						variant="pills"
						className="mb-2 border-bottom bg-custom"
					>
						<Tab eventKey="latest_update" title="Latest updates">
							{/* scripts/display.req.php line 123 */}
							<Row className="m-0">
								{renderMangas()}
							</Row>
						</Tab>
						<Tab eventKey="follows_update" title="Follows updates">
							<Row className="m-0">
								{follows_render()}
							</Row>
						</Tab>
					</Tabs>
				</Card>
			</Col>
		)
	}
}

export class TopList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangas: []
		}
	}

	componentDidMount() {
		if (this.props.type == "top_chapters_6h") {
			//TODO: This is top chapters, not top manga
			//TODO: Show chapter support
			/*API.manga({}, true, 10, 0).then(res => {
				console.log("Retrieve succeded!");
				this.setState({
					mangas: res
				});
			}).catch((e) => {
				console.log("Retrieve failed!");
				console.log(e);
			})*/
		}
		//top_chapters_24h
		if (this.props.type == "top_chapters_24h") {
		}
		//top_chapters_7d
		if (this.props.type == "top_chapters_7d") {
		}

		//There is no API for this, i can scrape for it, but for now its fixed
		//top_follows
		if (this.props.type == "top_follows") {
			API.manga({"ids": [
				"32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
				"4a76bf77-f757-46bd-9d82-f2a579bb1c63",
				"769a5e79-0670-4188-8582-035f0a3cc051",
				"879af0bb-ce30-47e4-a74e-cd1ce874c6e3",
				"a77742b1-befd-49a4-bff5-1ad4e6b0ef7b",
				"a96676e5-8ae2-425e-b549-7f15dd34a6d8",
				"bd6d0982-0091-4945-ad70-c028ed3c0917",
				"c099c678-8e69-4940-9d26-6effee70205b",
				"d8a959f7-648e-4c8d-8f23-f1f3f8e129f3",
				"eb2d1a45-d4e7-4e32-a171-b5b029c5b0cb"
			]}, true).then(res => {
				console.log("Retrieve succeded!");
				const mangas = res.data;
				mangas.sort((m1,m2) => m2.statistics.follows - m1.statistics.follows);
				this.setState({
					mangas: mangas
				});
			}).catch((e) => {
				console.log("Retrieve failed!");
				console.log(e);
			})
		}
		//top_rating
		if (this.props.type == "top_rating") {
			API.manga({"ids": [
				"0c697908-bafd-44ec-ae29-b8515becd506",
				"129c90ca-b997-4789-a748-e8765bc67a65",
				"12e28a8a-cbfe-4e12-bab8-b6fb0b9a59b4",
				"2e3ec8e6-cee0-4779-8f4e-c42ab683ef75",
				"473a1d69-0ef5-4882-a45b-ca55c181ce86",
				"73962987-7e02-4126-8405-4d75c2188d7f",
				"96471a2c-59f3-4a08-be7d-640bc0c022a4",
				"c8dcfca4-874f-45e2-ba01-959ea0b6f141",
				"d36b802a-7d1e-4153-80ee-b6ee509555ff",
				"feff4eaf-01df-4a05-83f4-68bb5cdf4fad"
			]}, true).then(res => {
				console.log("Retrieve succeded!");
				const mangas = res.data;
				mangas.sort((m1,m2) => m2.statistics.rating.bayesian - m1.statistics.rating.bayesian);
				this.setState({
					mangas: mangas
				});
			}).catch((e) => {
				console.log("Retrieve failed!");
				console.log(e);
			})
		}
	}

	_renderManga(manga,type) {
		if (type == "top_follows") {
			return (
				<span>
					<span className='text-success float-left'>{display_fa_icon('bookmark', 'Follows')} {manga.statistics.follows}</span>
					<span className='float-right'>
						<span className='text-primary'>{display_fa_icon('star', 'Bayesian rating')} {manga.statistics.rating.bayesian.toFixed(2)}</span> 
						<small title="count_pop">{display_fa_icon('user')} N/A</small>
					</span>
				</span>
			)
		}

		if (type == "top_rating") {
			return (
				<span>
					<span className='float-left'>
						<span className='text-primary'>{display_fa_icon('star', 'Bayesian rating')} {manga.statistics.rating.bayesian.toFixed(2)}</span> 
						<small title="count_pop">{display_fa_icon('user')} N/A</small>
					</span>
					<span className='text-success float-right'>{display_fa_icon('bookmark', 'Follows')} {manga.statistics.follows}</span>
				</span>
			)
		}

		return (
			<span>
				<span className='float-left'>{display_fa_icon('file', '', '', 'far')} {display_short_title(manga)}</span>
				<span className='float-right' title="chapter_views">{display_fa_icon('eye', 'Views')} N/A</span>
			</span>
		)
	}

	render() {
		const mangas = this.state.mangas;

		if (mangas.length <= 0) {
			return (
				<ul className='list-group list-group-flush'>
					<li className='list-group-item px-2 py-1'>
						<strong>No manga to display.</strong>
					</li>
				</ul>
			)
		}

		return (
			<ListGroup variant="flush" key={`${this.props.type}-${this.props.subtype}`}>
				{mangas.map((manga) => {
					return (
						<ListGroup.Item className="px-2 py-1" key={getUUID(manga)}>
							<div className='hover tiny_logo rounded float-left mr-2'>
								<a href={manga.getUrl()}>
									<img className='rounded max-width' src={manga.getCover256()} loading="lazy" />
								</a>
							</div>
							<div className='text-truncate pt-0 pb-1 mb-1 border-bottom'>{display_fa_icon('book', '', 'mr-1')} {display_manga_link_v2(manga)}</div>
							<p className='text-truncate py-0 mb-1'>
								{this._renderManga(manga,this.props.subtype)}
							</p>
						</ListGroup.Item>
					)
				})}
			</ListGroup>
		)
	}
}

export class Sidebars extends React.Component {
	constructor(props) {
		super(props);
	}

	static contextType = UserContext;

	render() { 
		const { user, setUser } = this.context;

		return (
			<Col lg={4}>
				{/* Reactify */}

				{/* Announcements */}
				{/*<div className="card mb-3 border-success">
					<h6 className="card-header text-center text-success border-success border-bottom">MangaDex@Home Update</h6>
					<div className="card-body text-center text-success">
						We are looking for more people to host a MD@H client to improve the <a href="https://mangadex.network/" target="_blank">MangaDex Network</a>! It is now possible to run a client without any knowledge of server management or running a java program. Please <a href="/md_at_home/info">check this out</a> if you"re interested.
					</div>
				</div>*/}

				{/*<div className="card mb-3">
					<h6 className="card-header text-center">We need your support!</h6>
					<div className="card-body text-center">
						Running MangaDex isn't cheap, but thanks to the generosity of our users, we have managed to cope so far without using any ads. We have recently upgraded to a new webserver, and our monthly costs have increased. Please consider <a href="/support">supporting</a> us! Every little counts.
					</div>
				</div>*/}

				{/*<div className="card mb-3 border-info">
					<h6 className="card-header text-center text-info border-info border-bottom">Announcement</h6>
					<div className="card-body text-center text-info">
				Emails stopped sending around 12AM UTC today, and was fixed at around 6AM UTC. If you made your account recently, resend the email for your activation code.
					</div>
				</div>*/}

				{/* Top chapters */}
				<Card className="card mb-3">
					<Card.Header className="text-center bg-custom">{display_fa_icon("external-link-alt")} <Link to="/stats/top">Top chapters</Link></Card.Header>
					<Tabs
						defaultActiveKey="top_chapters_6h"
						fill
						variant="pills"
						className="mb-2 border-bottom bg-custom"
					>
						<Tab eventKey="top_chapters_6h" title="6h">
							{/*TODO: Render on display, pass state on if displayed maybe*/}
							<TopList type="top_chapters_6h" subtype="top_rating" key={0}/>
						</Tab>
						<Tab eventKey="top_chapters_24h" title="24h">
							<TopList type="top_chapters_24h" subtype="top_rating" key={1}/>
						</Tab>
						<Tab eventKey="top_chapters_7d" title="7d">
							<TopList type="top_chapters_7d" subtype="top_rating" key={2}/>
						</Tab>
					</Tabs>
				</Card>

				{/* Social media row */}
				<div className="card mb-3">
					<h6 className="card-header text-center">Links</h6>
					<div className="card-body p-0">
						<div className="row ml-0 mr-0 justify-content-around social-media-btns">
							<div className="col-4 col-sm-2 col-lg-4 col-xl-2"><a title="@Mangadex on Twitter" href="https://twitter.com/MangaDex" target="_blank">Twitter</a></div>
							<div className="col-4 col-sm-2 col-lg-4 col-xl-2"><a title="/r/mangadex on Reddit" href="https://www.reddit.com/r/mangadex/" target="_blank">Reddit</a></div>
							<div className="col-4 col-sm-2 col-lg-4 col-xl-2"><a title="Mangadex on Discord" href="https://discord.gg/mangadex" target="_blank">Discord</a></div>
							<div className="col-4 col-sm-2 col-lg-4 col-xl-2"><a title="Mangadex Scanlation Bloghosting" href="https://mangadex.com/2018/09/17/hello-world/" target="_blank">Wordpress</a></div>
							<div className="col-4 col-sm-2 col-lg-4 col-xl-2"><a title="mangadex on tumblr" href="https://mangadexofficial.tumblr.com/" target="_blank">Tumblr</a></div>
						</div>
					</div>
				</div>

				{/* Latest news */}
				{/*
				<div className="card mb-3 ">
					<h6 className="card-header text-center">News</h6>
					display_latest_posts($templateVar["latest_news_posts"])
				</div>
				*/}
				{/* Reading history */}
				<div className="card mb-3">
					<h6 className="card-header text-center">{display_fa_icon("external-link-alt")} <Link to="/history">Reading history</Link></h6>
					{display_reading_history(user)}
				</div>
				{/* Top manga box */}
				<Card className="card mb-3">
					<Card.Header className="text-center bg-custom">{display_fa_icon("external-link-alt")} <Link to="/top">Top manga</Link></Card.Header>
					<Tabs
						defaultActiveKey="top_follows"
						fill
						variant="pills"
						className="mb-2 border-bottom bg-custom"
					>
						<Tab eventKey="top_follows" title="Follows">
							<TopList type="top_follows" subtype="top_follows" key={3} />
						</Tab>
						<Tab eventKey="top_rating" title="Rating">
							{/* Someone who understands ReactJS better must explain why this is a key violation */}
							<TopList type="top_rating" subtype="top_rating" key={4} />
						</Tab>
					</Tabs>
				</Card>

				{/* Latest comments */}
				{/*
				<div className="card mb-3">
					<h6 className="card-header text-center">Latest posts</h6>
					<div className="card-header p-0">
						<ul className="nav nav-pills nav-justified" role="tablist">
							<li className="nav-item"><a className="nav-link active" href="#forum_posts" aria-controls="six_hours" data-bs-toggle="tab">Forums</a></li>
							<li className="nav-item"><a className="nav-link" href="#manga_posts" aria-controls="day" data-bs-toggle="tab">Manga</a></li>
						</ul>
					</div>
					<div className="tab-content">
						<div role="tabpanel" className="tab-pane active" id="forum_posts">display_latest_posts($templateVar["latest_forum_posts"])</div>
						<div role="tabpanel" className="tab-pane" id="manga_posts">display_latest_comments($templateVar["latest_manga_comments"], "manga")</div>
					</div>
				</div>
				*/}
			</Col>
		)
	}
}
export class MangaTitles extends React.Component {
	/*
	if (is_array($templateVar['featured']) && !empty($templateVar['featured']))
		echo display_carousel($templateVar['featured'], 'Featured titles', 'hled_titles');

	if (is_array($templateVar['new_manga']) && !empty($templateVar['new_manga']))
		echo display_carousel($templateVar['new_manga'], 'New titles', 'new_titles');
	*/
	render() { 
		return (<div></div>)
	}
}