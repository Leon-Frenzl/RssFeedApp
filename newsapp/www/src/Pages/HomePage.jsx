import { SplitScreen } from "../LayoutComponents/SplitScreen/SpliteScreen"
import { Navbar } from "../LayoutComponents/Navbar/Navbar"

const RightHandComponent = () => {return(<h1 style ={{backgroundColor: 'red'}}>Home</h1>)}

export const HomePage = ({})=> {
    return (
        <div>
        <SplitScreen 
           left={Navbar}
           right={RightHandComponent}
        />
      </div>
    )
}