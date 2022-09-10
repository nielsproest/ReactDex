import React from "react";

import {
	Link
} from "react-router-dom";

import { 
	display_fa_icon,
	display_manga_link_v2,
	display_chapter_title,
	display_lang_flag_v3,
	display_group_link_v2,
	display_user_link_v2
} from "./partials"

import API from "./MangaDexAPI/API";

export class LastUpdated extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			mangas: []
		}
	}

	componentDidMount() {
		API.getFollowedManga(30, 0).then(res => {
			this.setState({
				mangas: res.data
			});
		}).catch((e) => {
			console.log("User not logged in!");
		})
	}

	render() {
		return (
			<div className="card mb-3" style={{paddingRight: "0px", paddingLeft: "0px"}}>
				<h6 className="card-header">{display_fa_icon('sync')} Latest updates</h6>
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
											<td rowSpan={this.state.mangas.length >= 1 ? 3 : this.state.mangas.length+1}>
												<div className="medium_logo rounded">
													<Link to={manga.getUrl()}>
														<img className="rounded" src={manga.getCover256()} alt="Thumb" />
													</Link>
												</div>
											</td>
											<td className="text-right"></td>
											<td colSpan="6" height="31px" className="position-relative">
												<span className="ellipsis">{display_fa_icon('book', 'Title')} {display_manga_link_v2(manga)}</span>
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
			{/*Pagination*/}
			</div>
		)
	}
}
