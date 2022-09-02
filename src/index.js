import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

//Load all themes (for that extra ram usage :) )
import './themes/Abyss.scss';
import './themes/Dark-Bronze.scss';
import './themes/Dark-Slate.scss';
import './themes/Dark.scss';
import './themes/Light-Bronze.scss';
import './themes/Light-Slate.scss';
import './themes/Light.scss';

import { 
	THEMES
} from "./user-context";


var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App/>
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
