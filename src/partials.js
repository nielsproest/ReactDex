import React from "react";
import Alert from 'react-bootstrap/Alert';
import {
	Link
} from "react-router-dom";
import { getTimeDiff } from "./utility";

//scripts/display.req.php

export function display_fa_icon(name, title="", _class="", set="fas") {
	return (<span className={`${set} fa-${name} fa-fw ${_class}`} aria-hidden='true' title={title} />)
}

export function display_alert(type, _class, strong, text) {
	{/* TODO: Use builtin alert */}
	return (
		<Alert variant={type} className={`${_class} text-center`}>
			<strong>{strong}:</strong> {text}
		</Alert>
	)
}

export function display_genres_checkboxes(grouped_genres, selected_genres = [], excluded_genres = [], isTertiary = true, useIndeterminate = false, inputName = 'manga_genres[]') {
	return (
		<React.Fragment>
			{Object.keys(grouped_genres).map((group) => {
				return (
					<div class='row mb-2'><span class='col-12 strong border-bottom mb-1'>{group}</span>
					{grouped_genres[group].map((t) => {
						const id = t.id;
						const name = t.attributes.name["en"];
						const classes = (isTertiary ? "tertiary " : "") + (useIndeterminate ? "indeterminate-mark" : "")
						const chipClasses = group === "Content" ? "badge-warning" : "badge-secondary";
						const state = excluded_genres.includes(id) ? 2 : (selected_genres.includes(id) ? 1 : 0);

						//TODO: Use indeterminate checkboxes for include/exclude
						return (
							<div class='col-6 col-md-4 col-lg-3 col-xl-2'>
								<div class='custom-control custom-checkbox form-check py-0' style={{display: "flex"}}>
									<input 
										type='checkbox' 
										class={`custom-control-input ${classes}`} 
										id={`checkbox-tag-${id}`} 
										name={inputName} 
										value={id} 
										checked={state} 
									/>
									<label 
										class='custom-control-label' 
										for={`checkbox-tag-${id}`}
									>
										<span class={`badge ${chipClasses}`}>{name}</span>
									</label>
								</div>
							</div>
						)
					})}
					</div>
				)
			})}
		</React.Fragment>
	)
}

export function display_genres_dropdown(grouped_genres, selected_genres = [], field_name = 'manga_genres') {
	//TODO: This
}

export function display_count_comments(count, type = '', chapter) {
	//TODO: Pretty display number with number_format
	if (count != null) {
		if (type)
			return (
				<a href={`${chapter.getUrl()}/comments`} className="disabled">
					<span class='badge badge-secondary' title={`${count} comments`}>
						{display_fa_icon('comments', '', '', 'far')}
						&nbsp;
						{count}
					</span>
				</a>
			)
		else
			return (
				<span class='badge badge-secondary'>
					{count}
				</span>
			)
	}
}

export function display_chapter_title(chapter, icon = false, truncate=true) {
	return (
		<React.Fragment>
			{icon && display_fa_icon('file', '', '', 'far')}
			<Link to={chapter.getUrl()} className={`${truncate && "text-truncate"}`}>
				{chapter.getTitle()}
			</Link>
		</React.Fragment>
	)
}

export function display_labels(hentai) {
	if (hentai)
		return (<span className='badge badge-danger ml-1'>H</span>);
}

export function display_manga_link_v2(manga, white = '', hide_labels=false, truncate=true) {
	return [(
		<Link 
			className={`manga_title clickable ${truncate ? 'text-truncate' : ''} ${white ? 'white' : ''}`}
			title='htmlentities($manga->manga_name, ENT_QUOTES)'
			to={manga.getUrl()}
		>
				{manga.getTitle()}
		</Link>),
		(hide_labels ? '' : display_labels(manga.isHentai()))
	];
}

export function display_short_title(chapter, white = '', truncate = '') {
	return (
		<Link 
			className={`${white ? 'white ' : ''} ${truncate ? 'text-truncate' : ''}`}
			to={chapter.getUrl()}
			style={{flex: truncate ? "0 1 auto" : ""}}>
			{chapter.getTitle()}
		</Link>
	);
}

export function display_group_link_v2(group) {
	if (Array.isArray(group) && group.length > 0) {
		group = group[0];
	}
	if (group == null) {
		return (<a>No Group</a>);
	}
	/*if (is_array($group)) {
		$group['group_id_2'] = $group['group_id_2'] ?? 0;
		$group['group_id_3'] = $group['group_id_3'] ?? 0;

		$group = (object) $group;
	}*/

	var data = (<Link to={group.getUrl()}>{group.getName()}</Link>);

	/*
	if (isset($group->group_id_2) && $group->group_id_2 > 0)
		$return .= " | <a href='/group/$group->group_id_2/" . slugify($group->group_name_2) . "'>$group->group_name_2</a>";

	if (isset($group->group_id_3) && $group->group_id_3 > 0)
		$return .= " | <a href='/group/$group->group_id_3/" . slugify($group->group_name_3) . "'>$group->group_name_3</a>";
	*/

	return data;
}

export function display_user_link(user, show_badge = 0, show_mah_badge = 0) {
	//$string = $show_badge ? " <a href='/support'>" . display_fa_icon('gem', 'Supporter', '', 'far') . "</a>" : '';
	//$string2 = $show_mah_badge ? " <a href='/md_at_home'>" . display_fa_icon('network-wired', 'MD@H Host', '', 'fas' . ($show_mah_badge == 2 ? ' text-warning' : '')) . "</a>" : '';
	return (
		<span>
			<Link 
				id={user.getId()}
				to={user.getUrl()}>
					{user.getName()}
			</Link>
		</span>
	)
}

export function display_user_link_v2(user, note = '') {
	var levelClassname = "user_level_member";

	const userrole = Array.from(user.attributes.roles);
	if (userrole.includes("ROLE_DEVELOPER")) {
		levelClassname = "user_level_dev";
	} else if (userrole.includes("ROLE_BANNED")) {
		levelClassname = "user_level_banned";
	} else if (userrole.includes("ROLE_STAFF")) {
		levelClassname = "user_level_staff";
	} else if (userrole.includes("ROLE_PUBLIC_RELATIONS")) {
		levelClassname = "user_level_relations";

	} else if (userrole.includes("ROLE_FORUM_MODERATOR") || userrole.includes("ROLE_GLOBAL_MODERATOR")) {
		levelClassname = "user_level_mod";
	} else if (userrole.includes("ROLE_VIP")) {
		levelClassname = "user_level_vip";
	} else if (userrole.includes("ROLE_DONOR")) { //Unsure
		levelClassname = "user_level_donor";
	} else if (userrole.includes("ROLE_POWER_UPLOADER")) {
		levelClassname = "user_level_power_uploader";
	} else if (userrole.includes("ROLE_MD_AT_HOME")) {
		levelClassname = "user_level_mdathome";
	} else if (userrole.includes("ROLE_GROUP_LEADER")) {
		levelClassname = "user_level_group_leader";
	} else if (userrole.includes("ROLE_CONTRIBUTOR")) {
		levelClassname = "user_level_contributor";
	} else if (userrole.includes("ROLE_GROUP_MEMBER")) {
		levelClassname = "user_level_group_member";
	}

	var string = (
		<Link 
			className={levelClassname}
			to={user.getUrl()}>
				{user.getName()}
		</Link>
	);

	return string;
}


export function display_lang_flag_v3(language, div = 0) {
	var res = (<span className={`rounded flag flag-${language}`} title='English'></span>)

	if (div) {
		return (<div>
			{res}
		</div>)
	}
	return res;
}

//TODO: Maybe move? Seems a little involved for a partial
export function display_reading_history(user) {
	if (user && false) {
		var chapter_history = user.get_reading_history();

		if (chapter_history) {
			return (
				<ul class='list-group list-group-flush'>
				{chapter_history.map((c) => {
					const manga = c.GetRelationship("manga")[0];
					const manga_cover = ""; //TODO: Either request or abandon

					return (
						<li class='list-group-item px-2 py-1'>
							<div class='hover tiny_logo rounded float-left mr-2'>
								<Link to={manga.getUrl()}>
									<img class='rounded max-width' src={manga_cover} />
								</Link>
							</div>
							<div class='pt-0 pb-1 mb-1 border-bottom d-flex align-items-center flex-nowrap'>
								{[
									display_fa_icon('book','','mr-1 flex-shrink-0'), 
									display_manga_link_v2(manga)
								]}
							</div>
							<p class='text-truncate py-0 mb-1'>
								<span class='float-left'>
									{[
										display_fa_icon('file', '', '', 'far'), 
										' ', 
										display_short_title(c)
									]}
								</span>
								<span class='float-right'>
									{[
										display_fa_icon('clock', '', '', 'far'), 
										' ', 
										getTimeDiff(Date.now() - c.attributes.createdAt)
									]}
								</span>
							</p>
						</li>
					)
				})}
				</ul>
			);
		} else {
			return (<p class='text-center m-0 p-3'>Go and read a chapter!</p>);
		}
	}

	//TODO: This function
	if (user) {
		return display_alert('info', 'm-2', 'Warning', 
			[
				"Not Implemented",
			]
		);
	}

	return display_alert('info', 'm-2', 'Notice', 
		[
			"Please ",
			display_fa_icon('sign-in-alt'),
			(
				<React.Fragment>
					<Link to='/login'>log in</Link> to view your reading history.
				</React.Fragment>
			)
		]
	);
}