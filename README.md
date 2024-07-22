<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">

<h1 align="center">Tip O' The Hat - Backend</h1>

  <p align="center">
    Backend connected to MongoDB.
    The backend is mainly used to run cronjobs to update the rounds in TOTH and store nominations and votes.
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

Tip O' The Hat: Pool Tips, Fund Awesomeness - A community initiative on Farcaster to promote & reward exceptional casts by pooling tips & conferring them to deserving creators incentivising quality & community.

Three stages: nomination, voting, distribution.

Users can nominate one cast per day. Nomination power is tripled for power badge holders.

The top five nominated casts proceed to voting. Power badge holders (only) can vote once per day.

Tips go to the cast creator. If the creator tags others, the tip is split equally. Roadmap: allow casters to specify percentage splits.

<!-- GETTING STARTED -->

## Getting Started

### Installation

1. Clone the repo

```sh
git clone https://github.com/leovido/toth-be.git
```

2. To run the app, run the following

```sh
npm i && nodemon
```

3. You will also need the following `.env` variables. Make sure to set up MongoDB on your end.

```
DB_INSTANCE="mongodb://localhost:27017/tipothehat"
PORT=3011
PUBLIC_URL="http://localhost:8080"
NEYNAR_API_KEY=NEYNAR_API_DOCS
```

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

See `LICENSE.txt` for more information.

<!-- CONTACT -->

## Contact

Leovido - [@warpcast handle](https://warpcast.com/leovido.eth) - toth.jazz924@passinbox.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>
