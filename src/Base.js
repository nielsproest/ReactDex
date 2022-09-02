import {
	Link,
	Navigate
} from "react-router-dom";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';

import React from "react";
import { 
	UserContext
} from "./user-context";

import { 
	display_fa_icon, 
	display_alert
} from "./partials"


export class LoginNote extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
		this.changeChild=React.createRef();
	}

	render() {
		if (this.props.user == null || this.props.user.getUser() == null) {
			return (
				<NavDropdown title={<span>{display_fa_icon('user-times')} Guest</span>} id="basic-nav-dropdown">
					<NavDropdown.Item as={Link} to="/login">{display_fa_icon('sign-in-alt', "Login")} Login</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/signup">{display_fa_icon('pencil-alt', "Signup")} Signup</NavDropdown.Item>
				</NavDropdown>
			)
		} else {
			const user = this.props.user.getUser();

			return (
				<NavDropdown title={<span>{display_fa_icon('user')} {user.attributes.username}</span>} id="basic-nav-dropdown">
					<NavDropdown.Item as={Link} to={user.getUrl()}>{display_fa_icon('user', "Profile")} Profile</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/history">{display_fa_icon('history', 'History')} History</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/settings">{display_fa_icon('cog', "Settings")} Settings</NavDropdown.Item>

					<NavDropdown.Divider></NavDropdown.Divider>

					<NavDropdown.Item as={Link} to="/list/{userId}">{display_fa_icon('list', 'My list')} MDList</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/social">{display_fa_icon('user-friends', 'social')} Social {false ? "<span class='badge badge-success'>$friend_requests</span>" : ''}</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/messages/notifications">{display_fa_icon('exclamation-circle', 'notifications')} Notifications {false ? "<span class='badge badge-info'>$unread_notifications</span>" : ''}</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/messages/inbox">{display_fa_icon('envelope', "Inbox")} Inbox {false ? "<span class='badge badge-danger'>$unread_pms</span>" : ''}</NavDropdown.Item>

					<NavDropdown.Divider></NavDropdown.Divider>

					<NavDropdown.Item as={Link} to="/support">{display_fa_icon('dollar-sign', 'support')} Support</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/md_at_home">{display_fa_icon('network-wired', 'MangaDex@Home')} MD@Home</NavDropdown.Item>
					<NavDropdown.Item as={Link} to="/shop">{display_fa_icon('store', 'shop')} Shop</NavDropdown.Item>

					<NavDropdown.Divider></NavDropdown.Divider>

					<NavDropdown.Item className="logout" as={Link} to="#">{display_fa_icon('sign-out-alt', "Logout")} Logout</NavDropdown.Item>
				</NavDropdown>
			)
		}
	}
}

export class DNavbar extends React.Component {
	constructor(props) {
		super(props);
		this.changeChild=React.createRef();
		this.state = {
			search: null
		}
	}

	static contextType = UserContext;

	render() {
		const { user, setUser } = this.context;

		//react-router-dom v6 is dumb
		const search_submit = (e) => {
			e.preventDefault();

			return this.setState({search: true});
		}
		const search_nav = () => {
			var text = document.getElementById("quick_search_form").value;
			var type = document.getElementById("quick_search_type").value;

			this.setState({search: null});
			return (<Navigate to={`/search?query=${encodeURI(text)}&type=${type}`} replace={true} />);
		}

		const follows_link = () => {
			if (user == null) {
				return (<Nav.Link as={Link} to="/login" title="You need to log in." style={{display: "flex", "alignItems": "center"}}>{display_fa_icon('bookmark')} Follows</Nav.Link>)
			}
			if (false) {
				return (<Nav.Link as={Link} to="/activation" title="You need to activate your account." style={{display: "flex", "alignItems": "center"}}>{display_fa_icon('bookmark')} Follows</Nav.Link>)
			}
			return (<Nav.Link as={Link} to="/follows" style={{display: "flex", "alignItems": "center"}}>{display_fa_icon('bookmark')} Follows</Nav.Link>)
		}

		return (
			<Navbar className="bg-custom navbar-custom" fixed="top" expand="lg">
				{this.state.search && (search_nav())}
				<Container fluid="lg">
					<Link to="/" style={{ textDecoration: 'none' }}>
						<Navbar.Brand>
							<img
							alt=""
							src="/logo192.png"
							width="30"
							height="30"
							className="d-inline-block align-top"
							/>{' '}
							ReactDex
						</Navbar.Brand>
					</Link>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="me-auto">
							<NavDropdown title={<span>{display_fa_icon('book')} Manga</span>} id="basic-nav-dropdown">
								<NavDropdown.Item as={Link} to="/titles">{display_fa_icon('book')} Titles</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="/updates">{display_fa_icon('sync')} Updates</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="/search">{display_fa_icon('search')} Search</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="/featured">{display_fa_icon('tv')} Featured</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="/random">{display_fa_icon('question-circle')} Random</NavDropdown.Item>
								<NavDropdown.Divider />
								<NavDropdown.Item as={Link} to="/manga_new">{display_fa_icon('plus-circle')} Add</NavDropdown.Item>
							</NavDropdown>

							{follows_link()}

							<NavDropdown title={<span>{display_fa_icon('users')} Community</span>} id="basic-nav-dropdown">
								<NavDropdown.Item as={Link} to="">{display_fa_icon('university')} Forums</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('users')} Groups</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('user')} Users</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('discord', 'Rules', '', 'fab')} Discord</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('twitter', 'Twitter', '', 'fab')} Twitter</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('reddit', 'Reddit', '', 'fab')} Reddit</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('tumblr', 'Tumblr', '', 'fab')} Tumblr</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('hashtag', 'IRC')} IRC</NavDropdown.Item>
							</NavDropdown>

							<NavDropdown title={<span>{display_fa_icon('info-circle')} Info</span>} id="basic-nav-dropdown">
								<NavDropdown.Item as={Link} to="">{display_fa_icon('clipboard-list', 'Stats')} Stats</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('list', 'Rules')} Rules</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('info', 'About')} About</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('code', 'Change log')} Change log</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('handshake', 'Affiliates', '', 'far')} Affiliates</NavDropdown.Item>
								<NavDropdown.Item as={Link} to="">{display_fa_icon('question', 'Tutorial')} Tutorial</NavDropdown.Item>
							</NavDropdown>
						</Nav>

						<Form className="d-flex" onSubmit={search_submit}>
							<Form.Select 
								style={{width: "fit-content"}} 
								defaultValue="titles"
								id="quick_search_type"
								className="form-control"
							>
								<option value="all">All</option>
								<option value="titles">Titles</option>
								<option value="groups">Groups</option>
								<option value="users">Users</option>
							</Form.Select>
							<Form.Control
								type="search"
								placeholder="Quick search"
								className="me-2"
								label="Search"
								id="quick_search_form"
							/>
						</Form>

						<Nav>
							<Nav.Link as={Link} to="#" style={{display: "flex", "alignItems": "center"}} onClick={() => this.changeChild.current.openModal()}>{display_fa_icon('cog', "Settings")}</Nav.Link>
							<LoginNote user={user}/>
						</Nav>
					</Navbar.Collapse>
				</Container>
				<DConfig ref={this.changeChild}/>
			</Navbar>
		);
	}
}

export function DFooter() {
	return (
		<footer className="footer">
			<p className="m-0 text-center text-muted" value="© 2018 - 2021 |&nbsp;">
				Powered by&nbsp;
				<a href="https://mangadex.org/" target="_blank" rel="noopener noreferrer" title="MangaDex">MangaDex</a> |&nbsp;
				<a href="https://mangadex.network/" target="_blank" rel="noopener noreferrer" title="MD@Home">MD@Home</a> |&nbsp;
				<a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer" title="Cloudflare">Cloudflare</a> |&nbsp;
				<a href="https://github.com/SagsMug/ReactDex" target="_blank" rel="noopener noreferrer" title="Github">Github</a>
			</p>
		</footer>
	);
}

class SiteTheme extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			theme: localStorage.getItem("TYPE_OF_THEME") != null ? localStorage.getItem("TYPE_OF_THEME") : "dark"
		}
	}

	setTheme(TYPE) {
		localStorage.setItem("TYPE_OF_THEME", TYPE);
		document.getElementsByTagName("body")[0].setAttribute("theme", TYPE);

		this.setState({
			theme: TYPE
		});
	}

	render() {
		return (
			<Form.Group className="row">
				<label htmlFor="language" className="col-lg-3 col-form-label-modal">Site theme:</label>
				<div className="col-lg-9">
					<select className="form-control selectpicker" onChange={(e) => {
						const TYPE = e.target.value;
						this.setTheme(TYPE);
					}} value={this.state.theme}>
						<option value={"light"}>Light</option>
						<option value={"dark"}>Dark</option>
						<option value={"light-bronze"}>Light-Bronze</option>
						<option value={"dark-bronze"}>Dark-Bronze</option>
						<option value={"light-slate"}>Light-Slate</option>
						<option value={"dark-slate"}>Dark-Slate</option>
						<option value={"abyss"}>Abyss</option>
					</select>
				</div>
			</Form.Group>
		)
	}
}

export class DConfig extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};
	}

	openModal = () => this.setState({ isOpen: true });
	closeModal = () => this.setState({ isOpen: false });
	saveModal = () => {
		//TODO: Save in localStorage
		return this.closeModal();
	}

	componentDidMount() {
		const TYPE = localStorage.getItem("TYPE_OF_THEME");
		if (TYPE != null) {
			document.getElementsByTagName("body")[0].setAttribute("theme", TYPE);
		}
	}

	loginWarning() {
		if (false) {
			return display_alert('info mx-auto', 'Info', [
				"These settings are temporary. Please ",
				display_fa_icon('pencil-alt'),
				" ",
				<Link to='/signup'>make an account</Link>,
				" to remember these permanently."
			]);
		} else {
			return (<Link className="btn btn-secondary mx-auto" role="button" to="/settings">{display_fa_icon('cog')} More settings</Link>)
		}
	}
	hentaiMenu() {
		if (true) {
			return (<div className="form-group row">
				<label className="col-lg-3 col-form-label-modal" htmlFor="hentai_mode">Hentai:</label>
				<div className="col-lg-9">
					<select className="form-control selectpicker show-tick" id="hentai_mode" name="hentai_mode">
						<option value="0" >Hide H</option>
						<option value="1" >All</option>
						<option value="2" >Only H</option>
					</select>
				</div>
			</div>);
		}
	}

	render() { 
		return (
			<Modal 
				show={this.state.isOpen}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton onHide={() => this.closeModal()}>
					<Modal.Title id="contained-modal-title-vcenter">{display_fa_icon('cog')} MangaDex settings</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
						<SiteTheme />
						<Form.Group className="form-group row">
							<label htmlFor="default_lang_ids" className="col-lg-3 col-form-label-modal">Filter chapter languages:</label>
							<Col lg="9">
								<select multiple className="form-control selectpicker show-tick" data-actions-box="true" data-selected-text-format="count > 5" data-size="10" id="default_lang_ids" name="default_lang_ids[]" title="All langs">
									display_languages_select($templateVar['lang_id_filter_array'])
								</select>
							</Col>
						</Form.Group>
						<Form.Group className="form-group row">
							<label htmlFor="display_language" className="col-lg-3 col-form-label-modal">User interface language:</label>
							<Col lg="9">
								<select className="form-control selectpicker" id="display_lang_id" name="display_lang_id" data-size="10">
									display_languages_select([$templateVar['ui_lang']-lang_id])
								</select>
							</Col>
						</Form.Group>
						{this.hentaiMenu()}
						<Form.Group className="row">
							<div className="col-lg-3 text-right">
								<button type="submit" className="btn btn-secondary" id="homepage_settings_button">{display_fa_icon('save')} Save</button>
							</div>
							<div className="col-lg-9 text-left">

							</div>
						</Form.Group>
					</Form>
				</Modal.Body>

				<Modal.Footer>
					{this.loginWarning()}
				</Modal.Footer>
			</Modal>
		)
	}
}
