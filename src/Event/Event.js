const { gql } = require("apollo-server");
const { authenticated, authorized } = require("../utils/Auth");

export const typeDefs = gql`
  enum WEEK_DAY {
    SUNDAY
    MONDAY
    TUESDAY
    WEDNESDAY
    THURSDAY
    FRIDAY
    SATURDAY
  }

  type Event {
    id: ID!
    type: String!
    createdAt: String!
    updatedAt: String!
    patrol: Patrol
    troop: Troop
    title: String!
    description: String
    datetime: String
    date: String
    time: String
    location: Location!
    meetLocation: Location
    startDate: String
    endDate: String
    recurring: Boolean
    day: WEEK_DAY
    distance: Int
    published: Boolean!
    creator: User
  }

  input AddHikeInput {
    title: String!
    description: String!
    datetime: String!
    location: CreateLocationInput
    meetLocation: CreateLocationInput
    distance: Int
    troop: ID
    patrol: ID
  }

  input UpdateHikeInput {
    title: String
    description: String
    date: String
    location: CreateLocationInput
    meetLocation: CreateLocationInput
    distance: Int
    troop: ID
    patrol: ID
  }

  input AddScoutMeetingInput {
    title: String!
    description: String!
    location: CreateLocationInput
    meetLocation: CreateLocationInput
    time: String!
    startDate: String!
    endDate: String!
    recurring: Boolean
    day: WEEK_DAY
    troop: ID
    patrol: ID
  }

  input UpdateScoutMeetingInput {
    title: String
    description: String
    location: CreateLocationInput
    meetLocation: CreateLocationInput
    time: String
    startDate: String
    endDate: String
    recurring: Boolean
    day: WEEK_DAY
    troop: ID
    patrol: ID
  }

  type Location {
    lat: Float!
    lng: Float!
  }

  input LocationInput {
    lat: Float!
    lng: Float!
  }

  input LocationUpdateInput {
    lat: Float
    lng: Float
  }

  input CreateLocationInput {
    create: LocationInput
  }

  extend type Query {
    events(first: Int, skip: Int): [Event]
    hikes: [Event]
    hike(id: ID!): Event
    scoutMeetings: [Event]
    scoutMeeting(id: ID!): Event
  }

  extend type Mutation {
    addHike(input: AddHikeInput!): Event
    updateHike(input: UpdateHikeInput!, id: ID!): Event
    deleteHike(id: ID!): Event
    addScoutMeeting(input: AddScoutMeetingInput!): Event
    updateScoutMeeting(input: UpdateScoutMeetingInput!, id: ID!): Event
    deleteScoutMeeting(id: ID!): Event
  }
`;

export const resolvers = {
  Event: {
    troop: async (parent, __, { Troop }) => await Troop.findById(parent.troop),
    patrol: async (parent, __, { Troop }) => {
      const myTroop = await Troop.findById(parent.troop);
      const myPatrol = await myTroop.patrols.id(parent.patrol);
      return myPatrol;
    },
    creator: async (parent, __, { User }) =>
      await User.findById(parent.creator),
  },
  Query: {
    events: async (_, { first, skip }, { Event, user }) => {
      return await Event.find({}, null, {
        first,
        skip,
      });
    },

    hike: async (_, { id }, { Event }) => await Event.findById(id),
    hikes: async (_, { first, skip }, { Event }) =>
      await Event.find({ type: "Hike" }, null, { first, skip }),
    scoutMeeting: async (_, { id }, { Event }) => await Event.findById(id),
    scoutMeetings: async (_, { first, skip }, { Event }) =>
      await Event.find({ type: "ScoutMeeting" }, null, { first, skip }),
  },
  Mutation: {
    addHike: authenticated(async (_, { input }, { Event, user }) => {
      const hikeMutation = {
        ...input,
        type: "Hike",
        troop: user.troop,
        patrol: user.patrol,
        creator: user.id,
      };

      return await Event.create(hikeMutation);
    }),

    updateHike: authenticated(
      async (_, { input, id }, { Event }) =>
        await Event.findByIdAndUpdate(id, { ...input })
    ),
    deleteHike: authenticated(
      async (_, { id }, { Event }) =>
        await Event.findByIdAndDelete(id, { ...input })
    ),
    addScoutMeeting: authenticated(async (_, { input }, { Event, user }) => {
      const scoutMeetingMutation = {
        ...input,
        type: "ScoutMeeting",
        creator: user.id,
      };

      const newEvent = await Event.create(scoutMeetingMutation);

      return await Event.findById(newEvent.id)
        .populate("creator")
        .populate("troop");
    }),
    updateScoutMeeting: authenticated(
      async (_, { input, id }, { Event }) =>
        await Event.findByIdAndUpdate(id, { ...input })
    ),
    deleteScoutMeeting: authenticated(
      async (_, { id }, { Event }) =>
        await Event.findByIdAndDelete(id, { ...input })
    ),
  },
};
