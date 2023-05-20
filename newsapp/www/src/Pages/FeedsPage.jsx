import { SplitScreen } from "../LayoutComponents/SplitScreen/SpliteScreen"
import { Navbar } from "../LayoutComponents/Navbar/Navbar"
import { CardGrid } from "../LayoutComponents/CardGrid/CardGrid"

const RightHandComponent = () => {return(<h1 style ={{backgroundColor: 'red'}}>Right</h1>)}

export const FeedsPage = ({})=> {
    return (
        <div>
        <SplitScreen 
           left={Navbar}
           right={RightHandComponent}
        />
      </div>
    )
}