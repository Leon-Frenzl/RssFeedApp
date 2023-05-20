import { SplitScreen } from "../LayoutComponents/SplitScreen/SpliteScreen"
import { Navbar } from "../LayoutComponents/Navbar/Navbar"
import { CardGrid } from "../LayoutComponents/CardGrid/CardGrid";

const cards = [
  {
    id: 1,
    image: "https://picsum.photos/300/200?random=1",
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    image: "https://picsum.photos/300/200?random=2",
    title: "Dolor sit amet",
    text: "Dolor sit amet, consectetur adipiscing elit. Sed quis.",
  },
  {
    id: 3,
    image: "https://picsum.photos/300/200?random=3",
    title: "Consectetur adipiscing",
    text: "Consectetur adipiscing elit. Sed quis leo vel nisi.",
  },
  {
    id: 1,
    image: "https://picsum.photos/300/200?random=1",
    title: "Lorem ipsum",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    image: "https://picsum.photos/300/200?random=2",
    title: "Dolor sit amet",
    text: "Dolor sit amet, consectetur adipiscing elit. Sed quis.",
  },
  {
    id: 3,
    image: "https://picsum.photos/300/200?random=3",
    title: "Consectetur adipiscing",
    text: "Consectetur adipiscing elit. Sed quis leo vel nisi.",
  },
];

export const HomePage = ({})=> {
    return (
        <div>
          <SplitScreen>
            <Navbar />
            <CardGrid cards={cards}/>
          </SplitScreen>
      </div>
    )
}