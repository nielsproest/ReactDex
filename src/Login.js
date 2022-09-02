import React, { useState } from "react";
import { UserContext } from "./user-context";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import Spinner from 'react-bootstrap/Spinner';

import API from "./MangaDexAPI/API";

import {
	Navigate
} from 'react-router-dom';

import { 
	display_fa_icon, 
	display_alert
} from "./partials"

export class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null
		}
	}

	static contextType = UserContext;

	render() {
		const { user, setUser } = this.context;

		if (user) {
			return (
				<div className="mx-auto form-narrow" id="login_container">
					<h1 className="text-center">Login</h1>
					<hr/>
					<p className="text-center text-muted">You are logged in.</p>
					<Navigate replace to={-1} />
				</div>
			)
		}

		return (
			<React.Fragment>
				{/* login_container */}
				<Container id="login_container">
					{this.state.error != null && (
						<Alert key="danger" variant="danger" className="fade show text-center">
							Error: {this.state.error}
						</Alert>
					)}
					<Row className="row justify-content-md-center">
						<Col md="auto" style={{
							marginLeft: "auto",
							marginRight: "auto"
						}}>
							<Form onSubmit={(e) => {
								e.preventDefault();
								const user = document.getElementById("formUsername").value;
								const pass = document.getElementById("formPassword").value;

								document.getElementById("loading_icon").style.display = "block";
								API.login(user,pass).then((data) => {
									document.getElementById("loading_icon").style.display = "none";

									const ut = data[0];
									const utdt = data[1];

									console.log("LoginPage", ut);
									if (ut != null) {
										console.log("success");
										ut.getInfo().then((_) => {
											setUser(ut);
										})
									} else {
										console.log("failed");
										this.setState({
											error: (<a>{JSON.stringify(utdt)}</a>)
										})
									}
								});
							}}>

								<Form.Group className="mb-3" controlId="formUsername">
									<Form.Label>Username</Form.Label>
									<Form.Control type="username" placeholder="Enter username" />
								</Form.Group>

								<Form.Group className="mb-3" controlId="formPassword">
									<Form.Label>Password</Form.Label>
									<Form.Control type="password" placeholder="Password" />
								</Form.Group>

								<Button variant="primary" type="submit">
									Submit
								</Button>

								<Spinner id="loading_icon" animation="border" role="status" style={{
									display: "none",
									float: "right"
								}}>
									<span className="visually-hidden">Loading...</span>
								</Spinner>
							</Form>
						</Col>
					</Row>
				</Container>
			</React.Fragment>
		)
	}
}