import {BrowserRouter, Routes, Route} from 'react-router-dom';

import { FeedsPage } from '../../Pages/FeedsPage';
import { MyFeedPage } from '../../Pages/MyFeedPage';
import { GroupsPage } from '../../Pages/GroupsPage';
import { FriendsPage } from '../../Pages/FriendsPage';
import { HomePage } from '../../Pages/HomePage';

export const AppRouter = ({})=> {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="*" element={
                    <HomePage />
                }/>
                <Route path="/feeds" element={
                    <FeedsPage />
                }/>
                <Route path="/myfeed" element={
                    <MyFeedPage />
                }/>
                <Route path="/groups" element={
                    <GroupsPage />
                }/>
                <Route path="/friends" element={
                    <FriendsPage />
                }/>
            </Routes>
        </BrowserRouter>
    )
}
