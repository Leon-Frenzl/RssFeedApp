import { Navbar } from "../LayoutComponents/Navbar/Navbar"
import { SplitScreen } from "../LayoutComponents/SplitScreen/SpliteScreen"

const RightHandComponent = () => {return(<h1 style ={{backgroundColor: 'yellow'}}>Right</h1>)}

export const MyFeedPage = ({})=> {
    return (
       <div>
         <SplitScreen 
            left={Navbar}
            right={RightHandComponent}
         />
       </div>
    )
}