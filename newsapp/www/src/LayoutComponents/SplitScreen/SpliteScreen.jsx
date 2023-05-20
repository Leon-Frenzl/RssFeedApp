import './SplitScreen.css';

export const SplitScreen = ({
    children
    
})=> {
    const [left, right] = children
    return (
        <div className="Container">
            <div className="Pane1">{left}</div>
            <div className="Pane2">{right}</div>
        </div>
    )
}
