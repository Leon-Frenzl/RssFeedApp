import './SplitScreen.css';

export const SplitScreen = ({
    left: Left,
    right: Right,
    
})=> {
    return (
        <div className="Container">
            <div className="Pane1"><Left /></div>
            <div className="Pane2"><Right /></div>
        </div>
    )
}
