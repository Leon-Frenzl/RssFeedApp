import { AppRouter } from "./AppRouter"

import './Navbar.css'

export const Navbar = ({})=> {
    return (
        <div className="Container">
            <ul id='Nav'>
                <div className="MenuButton"><li className="MenuItem"><a className="MenuLink" href="http://localhost:3000/feeds">Feeds</a></li></div>
                <div className="MenuButton"><li className="MenuItem"><a className="MenuLink" href="http://localhost:3000/myfeed">My Feed</a></li></div>
                <div className="MenuButton"><li className="MenuItem"><a className="MenuLink" href="http://localhost:3000/groups">Groups</a></li></div>
                <div className="MenuButton"><li className="MenuItem"><a className="MenuLink" href="http://localhost:3000/friends">Friends</a></li></div>
            </ul>
        </div>
    )
}
