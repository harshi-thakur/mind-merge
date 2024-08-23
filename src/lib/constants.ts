import client1 from '../../public/clients/client1.png';
import client2 from '../../public/clients/client2.png';
import client3 from '../../public/clients/client3.png';
import client4 from '../../public/clients/client4.png';
import client5 from '../../public/clients/client5.png';
import client6 from '../../public/clients/client6.png';
import client7 from '../../public/clients/client7.png';
import client8 from '../../public/clients/client8.png';

export const CLIENTS = [
  { alt: 'client1', logo: client1 },
  { alt: 'client2', logo: client2 },
  { alt: 'client3', logo: client3 },
  { alt: 'client4', logo: client4 },
  { alt: 'client5', logo: client5 },
  { alt: 'client6', logo: client6 },
  { alt: 'client7', logo: client7 },
  { alt: 'client8', logo: client8 },
];

export const USERS = [
  { name: 'Aisha', message: 'Mind Merge has been a game-changer for our team. With its reliable end-to-end testing, we catch bugs early, leading to faster development cycles and improved collaboration.' },
  { name: 'Rohan', message: "I used to spend hours debugging frontend issues, but Mind Merge simplified everything. Now, I'm more productive, and my colleagues can trust our code thanks to Mind Merge." },
  { name: 'Chandan', message: "Mind Merge has transformed the way we work. Our QA and development teams are on the same page, and our productivity has skyrocketed. It's a must-have tool." },
  { name: 'Dhruv', message: 'I was skeptical at first, but Mind Merge exceeded my expectations. Our project timelines have improved, and collaboration between teams is seamless.' },
  { name: 'Esha', message: "Mind Merge made writing and running tests a breeze. Our team's productivity has never been higher, and we're delivering more reliable software." },
  { name: 'Farhan', message: "Thanks to Mind Merge, we've eliminated testing bottlenecks. Our developers and testers collaborate effortlessly, resulting in quicker releases." },
  { name: 'Gauri', message: 'Mind Merge has improved our development process significantly. We now have more time for innovation, and our products are of higher quality.' },
  { name: 'Himesh', message: "Mind Merge's user-friendly interface made it easy for our non-technical team members to contribute to testing. Our workflow is much more efficient now." },
  { name: 'Ishaan', message: "Our team's collaboration improved immensely with Mind Merge. We catch issues early, leading to less friction and quicker feature deployments." },
  { name: 'Jatin', message: "Mind Merge's robust testing capabilities have elevated our development standards. We work more harmoniously, and our releases are more reliable." },
  { name: 'Kavita', message: "Mind Merge is a lifesaver for our cross-functional teams. We're more productive, and there's a shared sense of responsibility for product quality." },
  { name: 'Lokesh', message: "Mind Merge has helped us maintain high standards of quality. Our team's collaboration has improved, resulting in faster development cycles." },
  { name: 'Mansi', message: "Mind Merge is a powerful tool that improved our productivity and collaboration. It's now an integral part of our development process." },
  { name: 'Nikhil', message: "Mind Merge's user-friendly interface and detailed reporting have made testing a breeze. Our team's productivity is at an all-time high." },
  { name: 'Ojas', message: "We saw immediate benefits in terms of productivity and collaboration after adopting Mind Merge. It's an essential tool for our development workflow." },
  { name: 'Pooja', message: "Mind Merge has streamlined our testing process and brought our teams closer. We're more efficient and deliver better results." },
  { name: 'Quasar', message: 'Mind Merge has been a game-changer for us. Our productivity and collaboration have improved significantly, leading to better software.' },
  { name: 'Rahul', message: 'Thanks to Mind Merge, our testing process is now a seamless part of our development cycle. Our teams collaborate effortlessly.' },
  { name: 'Sajan', message: 'Mind Merge is a fantastic tool that has revolutionized our workflow. Our productivity and collaboration have reached new heights.' },
];

export const PRICING_CARDS = [
  {
    planType: 'Free Plan',
    price: '0',
    description: 'Limited block trials  for teams',
    highlightFeature: '',
    freatures: [
      'Limited blocks for teams',
      'Limited file uploads',
      'Invite 2 guests',
    ],
  },
  {
    planType: 'Pro Plan',
    price: '200',
    description: 'Billed annually. Rs149 billed monthly',
    highlightFeature: 'Everything in free +',
    freatures: [
      'Unlimited blocks for teams',
      'Unlimited file uploads',
      'Invite 10 guests',
      'Publish the block'
    ],
  },
];

export const PRICING_PLANS = { proplan: 'Pro Plan', freeplan: 'Free Plan' };

export const MAX_FOLDERS_FREE_PLAN = 3;
