import { SplitScreen } from "../LayoutComponents/SplitScreen/SpliteScreen"
import { Navbar } from "../LayoutComponents/Navbar/Navbar"

const RightHandComponent = () => {return(<h1 style ={{backgroundColor: 'blue'}}>Right</h1>)}

export const FriendsPage = ({})=> {
    return (
        <div>
        <SplitScreen 
           left={Navbar}
           right={RightHandComponent}
        />
      </div>
    )
}