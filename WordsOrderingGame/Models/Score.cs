using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace WordsOrderingGame.Models
{
    public class Score
    {
        public Guid Id { get; set; }

        [Range(0, int.MaxValue)]
        public int Rank { get; set; }

        public string Name { get; set; }

        [Range(0, int.MaxValue)]
        public int TimeInSecond { get; set; }
        
        public DateTime SubmittedTime { get; set; }
    }
}