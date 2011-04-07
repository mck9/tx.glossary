from zope import schema
from zope.interface import Interface

from zope.app.container.constraints import contains
from zope.app.container.constraints import containers

from tx.glossary import txMessageFactory as _

class IGlossaryFolder(Interface):
    """A Folder for GlossaryItems"""
    
    # -*- schema definition goes here -*-
