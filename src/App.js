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
	DFooter
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
	UserToken
} from "./MangaDexAPI/API"

import { UserContext } from "./user-context";

//Theme context

/*
TODO:
MangaDex API
	Read data
	Login
Manga page (manga/manga.tpl.php)
Reader
Frontpage
	Fix remaining lists
	Carousel (builtin bootstrap?) https://react-bootstrap.netlify.app/components/carousel/#rb-docs-content
Browse
	Search
	Tags
User
	Local user settings
	Browse other users
Groups
Settings page
*/

//TODO: Move these to their seperate files
function MangaPage() {
	let { mangaId, mangaTitle } = useParams();

	return (
		<Row bsPrefix="notrow">
			<MangaDisplay id={mangaId}/>
		</Row>
	);
}

function Home() {
	document.title = "Home - ReactDex";

	return (
		<Row>
			<Announcements/>
			<MangaCards/>
			<Sidebars/>
			<MangaTitles/>
		</Row>
	);
}

function Chapter() {
	let { chapterId } = useParams();
	const navigation = useNavigate();

	return (
		<ChapterDisplay id={chapterId} nav={navigation}/>
	);
}

function Group() {
	let { groupId, groupTitle } = useParams();

	return (
		<Row>
			Group page goes here |{groupId}| |{groupTitle}|
		</Row>
	);
}

function UserPage() {
	let { userId, userTitle } = useParams();

	return (
		<Row>
			User page goes here |{userId}| |{userTitle}|
		</Row>
	);
}

function Search() {
	document.title = `Search ${search_query} - ReactDex`;

	const useQuery = new URLSearchParams(useLocation().search);

	const search_query = useQuery.get("query");
	const type_query = useQuery.get("type");

	//TODO: Learn about url parameters
	return (
		<Row>
			Search page goes here |{search_query}| |{type_query}|
		</Row>
	);
}

function PLogin() {
	document.title = "Login - ReactDex";

	return (
		<Row>
			<Login/>
		</Row>
	);
}

function Signup() {
	document.title = "Signup - ReactDex";

	return (
		<Row>
			Signup page goes here
		</Row>
	);
}

function Follows() {
	document.title = "Follows - ReactDex";

	return (
		<Row>
			Follows page goes here
		</Row>
	);
}

function Updates() {
	document.title = "Updates - ReactDex";

	return (
		<Row>
			Updates page goes here
		</Row>
	);
}

function Titles() {
	document.title = "Titles - ReactDex";

	return (
		<Row>
			Titles page goes here
		</Row>
	);
}

function Featured() {
	document.title = "Featured - ReactDex";

	return (
		<Row>
			Featured page goes here
		</Row>
	);
}

function Random() {
	document.title = "Random - ReactDex";

	return (
		<Row>
			Random page goes here
		</Row>
	);
}

function History() {
	document.title = "History - ReactDex";

	return (
		<Row>
			History page goes here
		</Row>
	);
}

function Top() {
	document.title = "Top - ReactDex";

	return (
		<Row>
			RIP Technoblade 
		</Row>
	);
}

function PageNotFound() {
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

//TODO: Move into login file
function LoginCheck() {
	const {user,setUser} = useContext(UserContext);
	useEffect(() => {
		if (user == null || user.getUser() == null) {
			const cat = localStorage.getItem("USERTOKEN");
			if (cat) {
				const UT = new UserToken(JSON.parse(cat), true);
				UT.refresh().then((_) => {
					if (UT.state != undefined && UT.state.valid) {
						UT.getInfo().then((_) => {
							setUser(UT);
							UT.refreshTimer();
						});
					} else {
						localStorage.removeItem("USERTOKEN");
						setUser(null);
					}
				})
			}
		}	
	})
	return (<React.Fragment />)
}

function App() {
	const [ user, setUser ] = useState(null);

	return (
		<Router>
			<UserContext.Provider value={{ user, setUser }}>
				<LoginCheck />
				<DNavbar/>
				<Container fluid="xxl" role="main" id="content" style={{
					marginBottom: "50px", 
					marginTop: "20px"
				}}>
					<Routes>
						<Route path="/" element={<Home/>}></Route>
						<Route path="/manga/:mangaId" element={<MangaPage/>}></Route>
						<Route path="/manga/:mangaId/:mangaTitle" element={<MangaPage/>}></Route>
						<Route path="/group/:groupId" element={<Group/>}></Route>
						<Route path="/group/:groupId/:groupTitle" element={<Group/>}></Route>
						<Route path="/user/:userId" element={<UserPage/>}></Route>
						<Route path="/user/:userId/:userTitle" element={<UserPage/>}></Route>
						<Route path="/chapter/:chapterId" element={<Chapter/>}></Route>
						<Route path="/titles" element={<Titles/>}></Route>
						<Route path="/history" element={<History/>}></Route>
						<Route path="/top" element={<Top/>}></Route>
						<Route path="/featured" element={<Featured/>}></Route>
						<Route path="/random" element={<Random/>}></Route>
						<Route path="/search" element={<Search/>}></Route>
						<Route path="/follows" element={<Follows/>}></Route>
						<Route path="/updates" element={<Updates/>}></Route>
						<Route path="/login" element={<PLogin/>}></Route>
						<Route path="/signup" element={<Signup/>}></Route>

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
