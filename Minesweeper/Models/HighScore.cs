using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Minesweeper.Models
{
    public class HighScore
    {
        public Guid HighScoreID { get; set; }
        public string Name { get; set; }
        public int Score { get; set; }
        public DateTime DateRecorded { get; set; }
    }
}