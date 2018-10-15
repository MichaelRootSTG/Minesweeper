using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Minesweeper.Controllers;

namespace Tests
{
    [TestClass]
    public class HomeControllerTests
    {
        HomeController homeController;

        [TestInitialize]
        public void Initialize()
        {
            homeController = new HomeController();
        }

        [TestMethod]
        public void Index()
        {
            Assert.AreEqual(1, 1);
        }

        [TestMethod]
        public void NewGame()
        {
            Assert.AreEqual(1, 1);
        }

        [TestMethod]
        public void Find()
        {
            Assert.AreEqual(1, 1);
        }

        [TestMethod]
        public void ShowAllMines()
        {
            Assert.AreEqual(1, 1);
        }
    }
}
