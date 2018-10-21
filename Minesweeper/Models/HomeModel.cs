using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Minesweeper.Models
{
    public class HomeModel
    {
        public IEnumerable<HighScore> HighScores { get; set; }
    }
}