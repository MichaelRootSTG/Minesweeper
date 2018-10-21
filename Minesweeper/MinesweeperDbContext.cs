using Minesweeper.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Minesweeper
{
    public class MinesweeperDbContext : DbContext
    {
        public MinesweeperDbContext() : base("StringDBContext")
        {

        }

        public DbSet<HighScore> HighScores { get; set; }
    }
}