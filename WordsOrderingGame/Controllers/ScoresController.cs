﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using WordsOrderingGame.Models;

namespace WordsOrderingGame.Controllers
{
    public class ScoresController : ApiController
    {
        private string scoreFileDirectoryPath = HttpContext.Current.Server.MapPath("~/App_Data");
        private string scoreFilePath = HttpContext.Current.Server.MapPath("~/App_Data/scores.json");

        public ScoresController()
        {
        }
        
        /// <summary>
        /// Load top 10 scores
        /// GET: api/Scores
        /// </summary>
        /// <returns></returns>
        public async Task<IHttpActionResult> Get()
        {
            try
            {
                var scores = readScores();
                scores = scores.OrderBy(s => s.Rank).Take(10).ToList();
                return Ok(scores);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }

        /// <summary>
        /// Submit new score and return saved score with its rank
        /// POST: api/Scores
        /// </summary>
        /// <param name="score"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> Post([FromBody]Score score)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid data");
            }

            score.Id = Guid.NewGuid();
            score.SubmittedTime = DateTime.Now;

            var scores = readScores();

            scores.Add(score);

            var newScores = new List<Score>();

            var rank = 0;
            foreach (var sc in scores.OrderBy(s => s.TimeInSecond).ThenBy(s => s.SubmittedTime))
            {
                sc.Rank = ++rank;
                newScores.Add(sc);
            }

            File.WriteAllText(scoreFilePath, JsonConvert.SerializeObject(newScores.ToArray()));

            return Ok(score);
        }

        /// <summary>
        /// read scores from scores.json file into objects
        /// if the file or directory does not exists, create it
        /// </summary>
        /// <returns></returns>
        private IList<Score> readScores()
        {
            IList<Score> scores = new List<Score>();
            try
            {
                Directory.CreateDirectory(scoreFileDirectoryPath);
                using (StreamReader file = File.OpenText(scoreFilePath))
                {
                    scores = JsonConvert.DeserializeObject<IList<Score>>(file.ReadToEnd());
                }
            }
            catch (FileNotFoundException ex)
            {
                File.WriteAllText(scoreFilePath, JsonConvert.SerializeObject(scores.ToArray()));
            }

            return scores;
        }
    }
}
