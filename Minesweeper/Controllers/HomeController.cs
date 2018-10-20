using Minesweeper.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;

namespace Minesweeper.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public JsonResult NewGame()
        {
            TempData.Remove("Game");

            Random random = new Random();
            int expertMines = 20;
            int i = 0;
            var allMines = new List<Mine>();
            for (; i < expertMines; i++)
            {
                var validPosNotFound = true;

                while (validPosNotFound)
                {
                    var tryX = random.Next(30);
                    var tryY = random.Next(16);

                    if (!allMines.Any(a => a.XPos.Equals(tryX) && a.YPos.Equals(tryY)))
                    {
                        allMines.Add(new Mine()
                        {
                            XPos = tryX,
                            YPos = tryY
                        });
                        validPosNotFound = false;
                    }
                }
            }

            TempData.Add("Game", allMines);
            return Json(expertMines, JsonRequestBehavior.AllowGet);
        }

        public JsonResult Find()
        {
            var row = Request.QueryString["row"];
            var column = Request.QueryString["column"];
            var mineField = (List<Mine>)TempData.Values.FirstOrDefault();
            var result = new object();
            if (mineField.Any(a => a.XPos.ToString().Equals(column) && a.YPos.ToString().Equals(row))) {
                result = "Boom";
            }
            else
            {
                result = GetMineResult(Int32.Parse(column), Int32.Parse(row));
            }   
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ShowAllMines()
        {
            var mineField = (List<Mine>)TempData.Values.FirstOrDefault();
            return Json(mineField, JsonRequestBehavior.AllowGet);
        }

        #region Private Methods
        private List<Box> GetMineResult(int xPos, int yPos)
        {
            var mineField = (List<Mine>)TempData.Values.FirstOrDefault();
            var boxes = new List<Box>();

            var firstFind = FindTouching(xPos, yPos);
            boxes.Add(new Box() { XPos = xPos, YPos = yPos, Value = firstFind });

            if (firstFind == 0)
            {
                var letsGo = new Box() { XPos = xPos, YPos = yPos, Value = 0 };
                var finishedStartBoxes = new List<Box>();
                var startBoxes = new List<Box>() { letsGo };
                while(startBoxes.Count() > 0)
                {
                    var startBox = startBoxes.Where(a => !finishedStartBoxes.Any(b => b.XPos == a.XPos && b.YPos == a.YPos)).FirstOrDefault();
                    finishedStartBoxes.Add(startBox);
                    var results = ExposeFromStartBox(startBox);
                    boxes.AddRange(results.Where(a => !boxes.Any(b => b.XPos == a.XPos && b.YPos == a.YPos)));
                    startBoxes.AddRange(results.Where(a => a.Value == 0 && !finishedStartBoxes.Any(b => b.XPos == a.XPos && b.YPos == a.YPos) && !startBoxes.Any(c => c.XPos == a.XPos && c.YPos == a.YPos)));
                    startBoxes.Remove(startBox);
                }
            }

            return boxes;
        }

        private List<Box> ExposeFromStartBox(Box startBox)
        {
            var moreStartBoxes = new List<Box>();
            if (startBox.XPos > 0)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos - 1, YPos = startBox.YPos, Value = FindTouching(startBox.XPos - 1, startBox.YPos) });
            if (startBox.XPos < 30)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos + 1, YPos = startBox.YPos, Value = FindTouching(startBox.XPos + 1, startBox.YPos) });
            if (startBox.YPos > 0)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos, YPos = startBox.YPos - 1, Value = FindTouching(startBox.XPos, startBox.YPos - 1) });
            if (startBox.YPos < 16)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos, YPos = startBox.YPos + 1, Value = FindTouching(startBox.XPos, startBox.YPos + 1) });
            if (startBox.XPos > 0 && startBox.YPos > 0)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos - 1, YPos = startBox.YPos - 1, Value = FindTouching(startBox.XPos - 1, startBox.YPos - 1) });
            if (startBox.XPos > 0 && startBox.YPos < 16)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos - 1, YPos = startBox.YPos + 1, Value = FindTouching(startBox.XPos - 1, startBox.YPos + 1) });
            if (startBox.XPos < 30 && startBox.YPos < 16)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos + 1, YPos = startBox.YPos + 1, Value = FindTouching(startBox.XPos + 1, startBox.YPos + 1) });
            if (startBox.XPos < 30 && startBox.YPos > 0)
                moreStartBoxes.Add(new Box() { XPos = startBox.XPos + 1, YPos = startBox.YPos - 1, Value = FindTouching(startBox.XPos + 1, startBox.YPos - 1) });
            return moreStartBoxes;
        }

        private int FindTouching(int xPos, int yPos)
        {
            var mineField = (List<Mine>)TempData.Values.FirstOrDefault();
            int touchingCount = 0;

            // Look up
            if (mineField.Any(a => a.XPos.Equals(xPos) && a.YPos.Equals(yPos - 1)))
                touchingCount++;

            // Look down
            if (mineField.Any(a => a.XPos.Equals(xPos) && a.YPos.Equals(yPos + 1)))
                touchingCount++;

            // Look left
            if (mineField.Any(a => a.XPos.Equals(xPos - 1) && a.YPos.Equals(yPos)))
                touchingCount++;

            // Look right
            if (mineField.Any(a => a.XPos.Equals(xPos + 1) && a.YPos.Equals(yPos)))
                touchingCount++;

            // Up Left
            if (mineField.Any(a => a.XPos.Equals(xPos - 1) && a.YPos.Equals(yPos - 1)))
                touchingCount++;

            // Up Right
            if (mineField.Any(a => a.XPos.Equals(xPos + 1) && a.YPos.Equals(yPos - 1)))
                touchingCount++;

            // Down Left
            if (mineField.Any(a => a.XPos.Equals(xPos - 1) && a.YPos.Equals(yPos + 1)))
                touchingCount++;

            // Down Right
            if (mineField.Any(a => a.XPos.Equals(xPos + 1) && a.YPos.Equals(yPos + 1)))
                touchingCount++;

            return touchingCount;
        }
        #endregion
    }
}