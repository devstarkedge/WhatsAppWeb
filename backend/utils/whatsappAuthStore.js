const { RemoteAuth } = require('whatsapp-web.js');
const Project = require('../models/Project');

class DatabaseAuthStore {
  constructor(clientId) {
    this.clientId = clientId;
  }

  async sessionExists() {
    try {
      const project = await Project.findById(this.clientId);
      return project && project.whatsappSession ? true : false;
    } catch (error) {
      console.error('Error checking session existence:', error);
      return false;
    }
  }

  async save(session) {
    try {
      await Project.findByIdAndUpdate(this.clientId, {
        whatsappSession: session,
        whatsappConnected: true
      });
      // Only log once per session save, not every backup
     
        console.log('Session saved to database for project:', this.clientId);
      
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  async extract() {
    try {
      const project = await Project.findById(this.clientId);
      if (project && project.whatsappSession) {
        console.log('Session extracted from database for project:', this.clientId);
        return project.whatsappSession;
      }
      return null;
    } catch (error) {
      console.error('Error extracting session:', error);
      return null;
    }
  }

  async delete() {
    try {
      await Project.findByIdAndUpdate(this.clientId, {
        whatsappSession: null,
        whatsappConnected: false
      });
      console.log('Session deleted from database for project:', this.clientId);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}

module.exports = DatabaseAuthStore;
