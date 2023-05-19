import { AppRouter } from "./AppRouter"

export const Navbar = ({})=> {
    return (
        <div>
            <ul id='nav-list'>
                <li><a href="http://localhost:3000/feeds">Feeds</a></li>
                <li><a href="http://localhost:3000/myfeed">My Feed</a></li>
                <li><a href="http://localhost:3000/groups">Groups</a></li>
                <li><a href="http://localhost:3000/friends">Friends</a></li>
            </ul>
        </div>
    )
}
