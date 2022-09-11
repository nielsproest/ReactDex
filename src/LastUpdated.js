import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';

import {
	Link
} from "react-router-dom";

import { 
	display_fa_icon,
	display_manga_link_v2,
	display_chapter_title,
	display_lang_flag_v3,
	display_group_link_v2,
	display_user_link_v2, 
	display_alert
} from "./partials"

import API from "./MangaDexAPI/API";
import { DPagination } from "./Manga";

export class LastUpdated extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangas: [],
			mlimit: 30,
			moffset: 0,
			mtotal: 0
		}
	}

	componentDidMount() {
		console.log(this.props.user);
		if (this.props.user != null) {
			API.getFollowedManga(this.state.mlimit, this.state.moffset).then(res => {
				this.setState({
					mangas: res.data,
					mtotal: res.total
				});
			}).catch((e) => {
				console.log("User not logged in!");
			})
		}
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

		//TODO: Select between followed and general
		//TODO: Select mlimit
		return (
			<React.Fragment>
				{this.props.user == null && display_alert("info" ,"m-2 widthfix", "Notice", [
					"Please ",
					display_fa_icon("sign-in-alt"),
					" ",
					<Link to="/login">login</Link>,
					" to see updates from your follows."
				])}
				<div className="card mb-3" style={{paddingRight: "0px", paddingLeft: "0px"}}>
					<h6 className="card-header">{display_fa_icon('sync')} Latest updates</h6>
					{/* A comment */}
					<div className="table-responsive">
						<table className="table table-striped table-sm">
							<thead>
								<tr className="border-top-0">
									<th width="110px"></th>
									<th width="25px"></th>
									<th style={{minWidth: "150px"}}></th>
									<th className="text-center" width="30px">{display_fa_icon('globe', 'Language')}</th>
									<th style={{minWidth: "150px"}}>{display_fa_icon('users', 'Group')}</th>
									<th className="d-none d-lg-table-cell">{display_fa_icon('user', 'Uploader')}</th>
									<th className="d-none d-lg-table-cell text-center text-info">{display_fa_icon('eye', 'Views')}</th>
									<th style={{minWidth: "65px;"}} className="text-right">{display_fa_icon('clock', 'Uploaded', '', 'far')}</th>
								</tr>
							</thead>
							<tbody>
								{this.state.mangas.map((manga) => {
									return (
										<React.Fragment>
											<tr>
												{/* Should be 4 ? 5 */}
												<td rowSpan={this.state.mangas.length >= 1 ? 2 : this.state.mangas.length+1}>
													<div className="medium_logo rounded" style={{
														display: "flex",
														justifyContent: "center"
													}}>
														<Link to={manga.getUrl()}>
															<img 
																className="rounded" 
																src={manga.getCover256()} 
																alt="Thumb" 
																style={{
																	objectFit: "scale-down",
																	height: "100%",
																}}
															/>
														</Link>
													</div>
												</td>
												<td className="text-right"></td>
												<td colSpan="6" height="31px" className="position-relative">
													<span className="ellipsis">
														{display_fa_icon('book', 'Title')} {display_manga_link_v2(manga)}
													</span>
												</td>
											</tr>
											{manga.GetRelationship("chapter").map((chapter) => {
												return(
													<tr>
														<td className="text-right"></td>
														<td>{display_chapter_title(chapter, true)}{false && (<span className="badge badge-primary">END</span>)}</td>
														<td className="text-center">{display_lang_flag_v3("en")}</td>
														<td className="position-relative">
															<span className="ellipsis">
																{chapter.GetRelationship("scanlation_group") != null && 
																	display_group_link_v2(chapter.GetRelationship("scanlation_group")[0])}
															</span>
														</td>
														<td className="d-none d-lg-table-cell">{display_user_link_v2(chapter.GetRelationship("user")[0])}</td>
														<td className="d-none d-lg-table-cell text-center text-info">N/A</td>
														<td className="text-right" title=""><time datetime="">{chapter.getUpdateDiff()}</time></td>
													</tr>
												)
											})}
										</React.Fragment>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>

				<DPagination 
					pages={Math.ceil(this.state.mtotal / this.state.mlimit)} 
					sizeof={this.state.mlimit} 
					callback={page_switch}
				/>
			</React.Fragment>
		)
	}
}
