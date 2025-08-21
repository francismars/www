// Bitcoin Events Data - Real Events for 2025
const eventsData = [
  {
    id: 1,
    name: "Bitcoin Medellin",
    date: "2025-01-17",
    endDate: "2025-01-18",
    type: "conference",
    location: "Medellin, Colombia",
    description: "Bitcoin conference in Medellin bringing together the Latin American Bitcoin community for education, networking, and adoption discussions.",
    website: "https://bitcoinmedellin.com/",
    contact: "info@bitcoinmedellin.com",
    featured: false
  },
  {
    id: 2,
    name: "Adopting Bitcoin Cape Town",
    date: "2025-01-24",
    endDate: "2025-01-25",
    type: "conference",
    location: "Cape Town, South Africa",
    description: "African Bitcoin conference focused on adoption, education, and building the Bitcoin ecosystem across the continent.",
    website: "https://za25.adoptingbitcoin.org/",
    contact: "za25@adoptingbitcoin.org",
    featured: false
  },
  {
    id: 3,
    name: "Plan ₿ Forum El Salvador",
    date: "2025-01-30",
    endDate: "2025-01-31",
    type: "conference",
    location: "San Salvador, El Salvador",
    description: "Bitcoin conference in El Salvador, the first country to adopt Bitcoin as legal tender. Focus on adoption, regulation, and innovation.",
    website: "https://planb.sv/",
    contact: "info@planb.sv",
    featured: false
  },
  {
    id: 4,
    name: "bitcoin++ levels up",
    date: "2025-02-19",
    endDate: "2025-02-22",
    type: "conference",
    location: "Florianopolis, Brasil",
    description: "Technical Bitcoin conference focused on development, innovation, and advancing the Bitcoin protocol. Brings together developers and researchers.",
    website: "https://btcplusplus.dev/conf/floripa",
    contact: "hello@btcplusplus.dev",
    featured: false
  },
  {
    id: 5,
    name: "Bitcoin Freedom Festival",
    date: "2025-02-23",
    endDate: "2025-02-24",
    type: "conference",
    location: "Uvita, Costa Rica",
    description: "Bitcoin conference in the beautiful coastal town of Uvita, focusing on freedom, adoption, and the Bitcoin lifestyle.",
    website: "https://www.bitcoinfreedomfestival.com/",
    contact: "info@bitcoinfreedomfestival.com",
    featured: false
  },
  {
    id: 6,
    name: "Mining Conference",
    date: "2025-04-03",
    endDate: "2025-04-04",
    type: "conference",
    location: "Dubai, UAE",
    description: "Global Bitcoin mining conference covering mining operations, hardware, energy, and the future of Bitcoin mining.",
    website: "https://miningconf.com/",
    contact: "info@miningconf.com",
    featured: false
  },
  {
    id: 7,
    name: "BitBlockBoom",
    date: "2025-04-04",
    endDate: "2025-04-05",
    type: "conference",
    location: "Dallas, Texas, USA",
    description: "Bitcoin conference in Dallas focusing on business adoption, investment, and the economic impact of Bitcoin.",
    website: "https://bitblockboom.com/",
    contact: "info@bitblockboom.com",
    featured: false
  },
  {
    id: 8,
    name: "CheatCode",
    date: "2025-04-11",
    endDate: "2025-04-13",
    type: "conference",
    location: "Bedford, UK",
    description: "Bitcoin conference in the UK focusing on education, adoption, and building the Bitcoin community across Britain.",
    website: "https://www.cheatcode.co.uk/",
    contact: "hello@cheatcode.co.uk",
    featured: false
  },
  {
    id: 9,
    name: "Bitcoin Oasis",
    date: "2025-04-15",
    endDate: "2025-04-17",
    type: "conference",
    location: "Dubai, UAE",
    description: "Bitcoin conference in Dubai focusing on Middle Eastern adoption, regulation, and the intersection of traditional finance with Bitcoin.",
    website: "https://bitcoin-oasis.com/",
    contact: "info@bitcoin-oasis.com",
    featured: false
  },
  {
    id: 10,
    name: "Swiss Bitcoin Conference",
    date: "2025-04-24",
    endDate: "2025-04-27",
    type: "conference",
    location: "Switzerland",
    description: "Major Bitcoin conference in Switzerland, bringing together European Bitcoin enthusiasts, developers, and businesses.",
    website: "https://swiss-bitcoin-conference.com/",
    contact: "info@swiss-bitcoin-conference.com",
    featured: false
  },
  {
    id: 11,
    name: "Tuscany Summit",
    date: "2025-05-07",
    endDate: "2025-05-08",
    type: "conference",
    location: "Viareggio, Italy",
    description: "Bitcoin conference in the beautiful Tuscany region of Italy, focusing on European adoption and community building.",
    website: "",
    contact: "info@tuscanybitcoin.com",
    featured: false
  },
  {
    id: 12,
    name: "Bitcoin++",
    date: "2025-05-07",
    endDate: "2025-05-09",
    type: "conference",
    location: "Austin, Texas, USA",
    description: "Technical Bitcoin conference in Austin, bringing together developers, researchers, and innovators to advance Bitcoin technology.",
    website: "https://btcplusplus.dev/",
    contact: "hello@btcplusplus.dev",
    featured: false
  },
  {
    id: 13,
    name: "Bitcoin Film Fest",
    date: "2025-05-23",
    endDate: "2025-05-25",
    type: "conference",
    location: "Warsaw, Poland",
    description: "Bitcoin conference combined with film festival, showcasing Bitcoin documentaries and educational content in Poland.",
    website: "",
    contact: "info@bitcoinfilmfest.pl",
    featured: false
  },
  {
    id: 14,
    name: "Oslo Freedom Forum",
    date: "2025-05-26",
    endDate: "2025-05-28",
    type: "conference",
    location: "Oslo, Norway",
    description: "Human rights and freedom conference that includes Bitcoin as a tool for financial freedom and human rights.",
    website: "https://oslofreedomforum.com/",
    contact: "info@oslofreedomforum.com",
    featured: false
  },
  {
    id: 15,
    name: "Bitcoin 2025",
    date: "2025-05-27",
    endDate: "2025-05-29",
    type: "conference",
    location: "Las Vegas, Nevada, USA",
    description: "The world's largest Bitcoin conference, featuring over 15,000 attendees, industry leaders, and comprehensive Bitcoin education.",
    website: "https://b.tc/conference/2025",
    contact: "info@bitcoin2025.com",
    featured: true
  },
  {
    id: 16,
    name: "BCC8333",
    date: "2025-06-06",
    endDate: "2025-06-07",
    type: "conference",
    location: "Barcelona, Spain",
    description: "Bitcoin conference in Barcelona focusing on European adoption, development, and community building.",
    website: "https://tickets.bcc8333.com/",
    contact: "info@bcc8333.com",
    featured: false
  },
  {
    id: 17,
    name: "BTC Prague",
    date: "2025-06-19",
    endDate: "2025-06-21",
    type: "conference",
    location: "Prague, Czech Republic",
    description: "Bitcoin conference in Prague, bringing together the Central European Bitcoin community for education and networking.",
    website: "https://btcprague.com/",
    contact: "info@btcprague.com",
    featured: false
  },
  {
    id: 18,
    name: "Bitcoin Rodeo",
    date: "2025-06-28",
    endDate: "2025-06-29",
    type: "conference",
    location: "Calgary, Alberta, Canada",
    description: "Bitcoin conference in Calgary with a Western theme, focusing on Canadian adoption and the Bitcoin community.",
    website: "https://bitcoinrodeo.com/",
    contact: "info@bitcoinrodeo.com",
    featured: false
  },
  {
    id: 19,
    name: "Bitcoin Alaska",
    date: "2025-07-01",
    endDate: "2025-07-06",
    type: "conference",
    location: "Juneau, Alaska, USA",
    description: "Week-long Bitcoin conference in Alaska, combining Bitcoin education with the natural beauty of the Last Frontier.",
    website: "https://bitcoinalaska.org/",
    contact: "info@bitcoinalaska.org",
    featured: false
  },
  {
    id: 20,
    name: "Mallorca Blockchain Days",
    date: "2025-07-10",
    endDate: "2025-07-13",
    type: "conference",
    location: "Mallorca, Spain",
    description: "Blockchain and Bitcoin conference on the beautiful island of Mallorca, focusing on European adoption and innovation.",
    website: "",
    contact: "info@mallorcablockchain.com",
    featured: false
  },
  {
    id: 21,
    name: "bitcoin++ goes private",
    date: "2025-08-07",
    endDate: "2025-08-08",
    type: "conference",
    location: "Riga, Latvia",
    description: "Private Bitcoin conference in Riga, focusing on technical discussions and development in an intimate setting.",
    website: "https://btcplusplus.dev/",
    contact: "hello@btcplusplus.dev",
    featured: false
  },
  {
    id: 22,
    name: "Baltic Honey Badger",
    date: "2025-08-09",
    endDate: "2025-08-10",
    type: "conference",
    location: "Riga, Latvia",
    description: "Bitcoin conference in the Baltic region, bringing together Eastern European Bitcoin enthusiasts and developers.",
    website: "https://baltichoneybadger.com/",
    contact: "info@baltichoneybadger.com",
    featured: false
  },
  {
    id: 23,
    name: "BTChel Conference 2025",
    date: "2025-08-15",
    endDate: "2025-08-16",
    type: "conference",
    location: "Helsinki, Finland",
    description: "Bitcoin conference in Helsinki, focusing on Nordic adoption and the intersection of technology and Bitcoin.",
    website: "https://btchel.com",
    contact: "info@btchel.com",
    featured: false
  },
  {
    id: 24,
    name: "bitcoin++ scales",
    date: "2025-09-03",
    endDate: "2025-09-05",
    type: "conference",
    location: "Istanbul, Turkey",
    description: "Bitcoin scaling conference in Istanbul, focusing on Layer 2 solutions, Lightning Network, and Bitcoin scalability.",
    website: "https://btcplusplus.dev/",
    contact: "hello@btcplusplus.dev",
    featured: false
  },
  {
    id: 25,
    name: "lightning++ strikes",
    date: "2025-10-02",
    endDate: "2025-10-04",
    type: "conference",
    location: "Berlin, Germany",
    description: "Lightning Network focused conference in Berlin, bringing together developers and enthusiasts of Bitcoin's Layer 2 solution.",
    website: "https://btcplusplus.dev/",
    contact: "hello@btcplusplus.dev",
    featured: false
  },
  {
    id: 26,
    name: "BitcoinForum Bayern",
    date: "2025-10-09",
    endDate: "2025-10-11",
    type: "conference",
    location: "Bayern, Germany",
    description: "Regional Bitcoin conference in Bavaria, Germany, focusing on local adoption and community building.",
    website: "https://bitcoinforum.bayern",
    contact: "info@bitcoinforum.bayern",
    featured: false
  },
  {
    id: 27,
    name: "BTC Balkans",
    date: "2025-10-18",
    endDate: "2025-10-19",
    type: "conference",
    location: "Sofia, Bulgaria",
    description: "Bitcoin conference in the Balkans region, bringing together Southeastern European Bitcoin communities.",
    website: "https://www.btcbalkans.com/",
    contact: "info@btcbalkans.com",
    featured: false
  },
  {
    id: 28,
    name: "Plan B Forum",
    date: "2025-10-24",
    endDate: "2025-10-25",
    type: "conference",
    location: "Lugano, Switzerland",
    description: "Bitcoin conference in Lugano, Switzerland, focusing on adoption, regulation, and the future of Bitcoin in Europe.",
    website: "https://planb.lugano.ch/planb-forum/",
    contact: "info@planbforum.ch",
    featured: false
  },
  {
    id: 29,
    name: "Sats Conf",
    date: "2025-11-07",
    endDate: "2025-11-08",
    type: "conference",
    location: "Sao Paulo, Brazil",
    description: "Bitcoin conference in Sao Paulo, focusing on Brazilian adoption and the Latin American Bitcoin ecosystem.",
    website: "https://satsconf.com.br/",
    contact: "info@satsconf.com.br",
    featured: false
  },
  {
    id: 30,
    name: "Bitcoin Amsterdam",
    date: "2025-11-13",
    endDate: "2025-11-14",
    type: "conference",
    location: "Amsterdam, Netherlands",
    description: "European Bitcoin conference in Amsterdam, bringing together the continental Bitcoin community for education and networking.",
    website: "https://www.bitcoin.amsterdam/",
    contact: "info@bitcoin.amsterdam",
    featured: false
  },
  {
    id: 31,
    name: "Adopting Bitcoin El Salvador",
    date: "2025-11-14",
    endDate: "2025-11-15",
    type: "conference",
    location: "El Salvador",
    description: "Bitcoin adoption conference in El Salvador, focusing on the country's experience as the first Bitcoin nation.",
    website: "https://sv25.adoptingbitcoin.org/",
    contact: "sv25@adoptingbitcoin.org",
    featured: true
  },
  {
    id: 32,
    name: "Noderunners Conference",
    date: "2025-11-01",
    endDate: "2025-11-01",
    type: "conference",
    location: "Amsterdam, Netherlands",
    description: "Bitcoin node operation and infrastructure conference in Amsterdam, focusing on running Bitcoin nodes and network security.",
    website: "https://noderunners.network/en/",
    contact: "",
    featured: false
  },
  {
    id: 33,
    name: "BitFest",
    date: "2025-11-21",
    endDate: "2025-11-23",
    type: "conference",
    location: "Manchester, UK",
    description: "Bitcoin festival and conference in Manchester, bringing together the UK Bitcoin community for education, networking, and celebration.",
    website: "https://bitfest.uk/",
    contact: "",
    featured: false
  },
  {
    id: 34,
    name: "La Bitconf",
    date: "2025-11-07",
    endDate: "2025-11-08",
    type: "conference",
    location: "Buenos Aires, Argentina",
    description: "Bitcoin conference in Buenos Aires, bringing together the Latin American Bitcoin community for education, networking, and adoption discussions.",
    website: "https://labitconf.com/",
    contact: "",
    featured: false
  },
  {
    id: 35,
    name: "Watchout Bitcoin",
    date: "2025-10-03",
    endDate: "2025-10-05",
    type: "conference",
    location: "Madrid, Spain",
    description: "Bitcoin conference in Madrid, focusing on European adoption, regulation, and the future of Bitcoin in Spain and the Iberian Peninsula.",
    website: "https://wobitcoin.org/",
    contact: "",
    featured: false
  }
];

// Helper function to get current date
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Helper function to check if event is upcoming
function isUpcoming(eventDate) {
  return eventDate >= getCurrentDate();
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to get month name
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

// Helper function to get days in month
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Helper function to get first day of month
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
