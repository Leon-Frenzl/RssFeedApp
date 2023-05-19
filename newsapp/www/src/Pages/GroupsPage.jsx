import { SplitScreen } from "../LayoutComponents/SplitScreen/SpliteScreen"
import { Navbar } from "../LayoutComponents/Navbar/Navbar"

const RightHandComponent = () => {return(<h1 style ={{backgroundColor: 'pink'}}>Right</h1>)}

export const GroupsPage = ({})=> {
    return (
        <div>
        <SplitScreen 
           left={Navbar}
           right={RightHandComponent}
        />
      </div>
    )
}