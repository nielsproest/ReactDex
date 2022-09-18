/*
Main App
*/

import "./themes/fontawesome/css/all.css";
import "./css/theme.css";
import "./css/App.css";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	useParams,
	useMatch,
	useLocation,
	useNavigate
} from "react-router-dom";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import React, { useState, useContext, useEffect } from "react";

import { 
	Announcements,
	MangaCards, 
	Sidebars, 
	MangaTitles
} from "./Home"

import { 
	DNavbar, 
	DFooter,
	SiteThemeSet
} from "./Base"

import { 
	MangaDisplay
} from "./Manga"

import {
	ChapterDisplay
} from "./Chapter"

import {
	Login
} from "./Login"

import {
	LastUpdated
} from "./LastUpdated"

import {
	SearchUI
} from "./ListSearch"

import {
	UserToken
} from "./MangaDexAPI/API"

import {
	userUUID
} from "./utility"

import { UserContext } from "./user-context";

//Theme context

/*
TODO:
Browse
	Tags
User
	Local user settings
	Browse other users
Groups
Settings page
*/

//TODO: Move these to their seperate files
function MangaPage(props) {
	let { mangaId, mangaTitle } = useParams();

	return (
		<Row bsPrefix="notrow">
			<MangaDisplay id={mangaId}/>
		</Row>
	);
}

function Home(props) {
	document.title = "Home - ReactDex";

	return (
		<Row>
			<Announcements/>
			<MangaCards user={props.user} key={`MangaCards ${userUUID(props.user)}`}/>
			<Sidebars user={props.user} key={`Sidebars ${userUUID(props.user)}`}/>
			<MangaTitles/>
		</Row>
	);
}

function Chapter(props) {
	let { chapterId } = useParams();
	const navigation = useNavigate();

	return (
		<ChapterDisplay user={props.user} id={chapterId} nav={navigation}/>
	);
}

function Group(props) {
	let { groupId, groupTitle } = useParams();

	return (
		<Row>
			Group page goes here |{groupId}| |{groupTitle}|
		</Row>
	);
}

function UserPage(props) {
	let { userId, userTitle } = useParams();

	return (
		<Row>
			User page goes here |{userId}| |{userTitle}|
		</Row>
	);
}

function Search(props) {
	const useQuery = new URLSearchParams(useLocation().search);
	const navigation = useNavigate();

	const search_query = useQuery.get("title");
	const rating_query = useQuery.getAll("rating");
	const tag_query = useQuery.getAll("tag");

	document.title = `Search ${search_query} - ReactDex`;

	return (
		<Row>
			<SearchUI 
				user={props.user} 
				nav={navigation} 
				title={search_query} 
				rating={rating_query} 
				tag={tag_query} 
			/>
		</Row>
	);
}

function PLogin(props) {
	document.title = "Login - ReactDex";

	return (
		<Row>
			<Login/>
		</Row>
	);
}

function PLogout(props) {
	document.title = "Logout - ReactDex";

	return (
		<Row>
			Hey
		</Row>
	);
}


function Signup(props) {
	document.title = "Signup - ReactDex";

	return (
		<Row>
			Signup page goes here
		</Row>
	);
}

function Follows(props) {
	document.title = "Follows - ReactDex";

	return (
		<Row>
			Follows page goes here
		</Row>
	);
}

function Updates(props) {
	document.title = "Updates - ReactDex";

	return (
		<Row>
			<LastUpdated user={props.user} key={`LastUpdated ${userUUID(props.user)}`}/>
		</Row>
	);
}

function Titles(props) {
	document.title = "Titles - ReactDex";

	return (
		<Row>
			Titles page goes here
		</Row>
	);
}

function Featured(props) {
	document.title = "Featured - ReactDex";

	return (
		<Row>
			Featured page goes here
		</Row>
	);
}

function Random(props) {
	document.title = "Random - ReactDex";

	return (
		<Row>
			Random page goes here
		</Row>
	);
}

function History(props) {
	document.title = "History - ReactDex";

	return (
		<Row>
			History page goes here
		</Row>
	);
}

function Groups(props) {
	let { groupTitle } = useParams();
	document.title = "Groups - ReactDex";

	return (
		<Row>
			Groups - {groupTitle}
		</Row>
	);
}

function Users(props) {
	let { userTitle } = useParams();
	document.title = "Users - ReactDex";

	return (
		<Row>
			Users - {userTitle}
		</Row>
	);
}

function Top(props) {
	document.title = "Top - ReactDex";

	return (
		<Row>
			RIP Technoblade 
		</Row>
	);
}

function Outside(props) {
	let { params } = useMatch("/outside/*");
	const linkUrl = params["*"];

	window.location.replace(linkUrl);

	return (
		<Row>
			These aren't the droids you're looking for
		</Row>
	);
}

function PageNotFound(props) {
	document.title = "Page not found - ReactDex";

	return (
		<Row>
			<div className="d-flex align-items-center justify-content-center toplike">
				<div className="card-body">
					<div className="text-center">
						<h1 className="display-1 fw-bold">404</h1>
						<p className="fs-3"> <span className="text-danger">Opps!</span> Page not found.</p>
						<p className="lead">
							The page you’re looking for doesn’t exist.
						</p>
						<Button as={Link} to="/">Go Home</Button>
					</div>
				</div>
			</div>
		</Row>
	);
}

function LoginCheck() {
	const { user, setUser } = useContext(UserContext);

	useEffect(() => {
		const TYPE = localStorage.getItem("TYPE_OF_THEME");
		if (TYPE != null) {
			console.log("SET_THEME", TYPE);
			SiteThemeSet(TYPE);
		}
	});

	const loginRefresh = (UT) => {
		UT.refresh().then((_) => {
			if (UT.state != undefined && UT.state.valid) {
				console.log("LoginCheck - Refresh succeeded");
				UT.getInfo().then((_) => {
					console.log("LoginCheck - getInfo succeeded");
					setUser(UT);
				});
			} else {
				console.log("LoginCheck - Refresh failed");
				localStorage.removeItem("USERTOKEN");
				setUser(null);
			}
		})
	}

	const loginCycle = () => {
		console.log("LoginCheck - Check");
		if (user == null || user.getUser() == null) {
			console.log("LoginCheck - User was null");
			const cat = localStorage.getItem("USERTOKEN");
			if (cat) {
				console.log("LoginCheck - Token exists");
				const UT = new UserToken(JSON.parse(cat), true);
				loginRefresh(UT);
			}
		} else if (user != null) {
			console.log("LoginCheck - User wasn't null");
			loginRefresh(user);
		}
	}

	const MINUTE_MS = 1000 * 60 * 10;
	useEffect(() => {
		loginCycle();

		const interval = setInterval(() => {
			loginCycle();
		}, MINUTE_MS);

		return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
	}, []);

	return (<React.Fragment />)
}

//TODO: Move login components here
class LoginForm extends React.Component {
	render() {
		return (<React.Fragment/>)
	}
}

function App() {
	const [ user, setUser ] = useState(null);
	//TODO: Remove static contextType = UserContext; and just pass user down, almost everything needs it

	return (
		<Router>
			<UserContext.Provider value={{ user, setUser }}>
				<LoginCheck />
				<LoginForm />
				<DNavbar/>
				<Container fluid="xxl" role="main" id="content">
					<Routes>
						<Route path="/" element={<Home user={user} />}></Route>
						<Route path="/manga/:mangaId" element={<MangaPage user={user} />}></Route>
						<Route path="/manga/:mangaId/:mangaTitle" element={<MangaPage user={user} />}></Route>
						<Route path="/group/:groupId" element={<Group user={user} />}></Route>
						<Route path="/group/:groupId/:groupTitle" element={<Group user={user} />}></Route>
						<Route path="/user/:userId" element={<UserPage user={user} />}></Route>
						<Route path="/user/:userId/:userTitle" element={<UserPage user={user} />}></Route>
						<Route path="/chapter/:chapterId" element={<Chapter user={user} />}></Route>
						<Route path="/outside/*" element={<Outside user={user} />}></Route>
						<Route path="/titles" element={<Titles user={user} />}></Route>
						<Route path="/history" element={<History user={user} />}></Route>
						<Route path="/top" element={<Top user={user} />}></Route>
						<Route path="/featured" element={<Featured user={user} />}></Route>
						<Route path="/random" element={<Random user={user} />}></Route>
						<Route path="/search" element={<Search user={user} />}></Route>
						<Route path="/groups/:groupTitle" element={<Groups user={user} />}></Route>
						<Route path="/users/:userTitle" element={<Users user={user} />}></Route>
						<Route path="/follows" element={<Follows user={user} />}></Route>
						<Route path="/updates" element={<Updates user={user} />}></Route>
						<Route path="/login" element={<PLogin user={user} setUser={setUser} />}></Route>
						<Route path="/logout" element={<PLogout user={user} setUser={setUser} />}></Route>
						<Route path="/signup" element={<Signup user={user} setUser={setUser} />}></Route>

						<Route path="*" element={<PageNotFound />}></Route>
					</Routes>
					<div id="message_container" className="display-none"></div>
					{/* mobile menus? */}
				</Container>
				<DFooter/>
			</UserContext.Provider>
		</Router>
	);
}

/*
https://api.mangadex.org/manga?limit=10&order[latestUploadedChapter]=asc
https://api.mangadex.org/manga?limit=10&order[updatedAt]=asc
*/

export default App;
