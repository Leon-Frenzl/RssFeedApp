import React from 'react';
import { Row, Col, Divider } from 'antd';
import FeedCard from './ExampleFeedCard';

function DashboardPage() {
  // Example feed data
  const feeds = [
    {
      title: 'Feed 1',
      author: 'Author 1',
      topic: 'Technology',
      length: 10,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description: 'This is a sample feed description.', // Update with your description
    },
    {
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },
    {
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },
    {
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },
    {
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },{
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },{
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },{
      title: 'Feed 2',
      author: 'Author 2',
      topic: 'Finance',
      length: 5,
      image: 'https://picsum.photos/400/400', // Update with your image path
      description:
        'This is another sample feed description.Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium optio, eaque rerum! Provident similique accusantium nemo autem. Veritatis', // Update with your description
    },
    // Add more feed data as needed
  ];

  const groupedFeeds = feeds.reduce((groups, feed) => {
    const group = groups.find((group) => group.topic === feed.topic);
    if (group) {
      group.feeds.push(feed);
    } else {
      groups.push({ topic: feed.topic, feeds: [feed] });
    }
    return groups;
  }, []);

  const getColProps = () => {
    const screenWidth = window.innerWidth;
    let colProps;

    if (screenWidth >= 1200) {
      colProps = { span: 6 };
    } else if (screenWidth >= 992) {
      colProps = { span: 8 };
    } else if (screenWidth >= 768) {
      colProps = { span: 12 };
    } else {
      colProps = { span: 24 };
    }

    const maxCardsPerRow = 4;
    const totalCards = groupedFeeds.reduce(
      (count, group) => count + group.feeds.length,
      0
    );
    const cardsPerRow = Math.min(totalCards, maxCardsPerRow);

    colProps.span = Math.floor(24 / cardsPerRow);
    colProps.style = { maxWidth: '300px' };

    return colProps;
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>Dashboard</h1>
      {groupedFeeds.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex !== 0 && <Divider orientation="left">{group.topic}</Divider>}
          <Row gutter={[16, 16]}>
            {group.feeds.map((feed, feedIndex) => (
              <Col key={feedIndex} {...getColProps()}>
                <FeedCard {...feed} />
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;
