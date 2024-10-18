"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, Search, Plus, User, DollarSign, Settings, LogOut, Eye, Download, Bookmark, Pencil, Trash2, FileText, MessageCircle, Send, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchListings, createListing, searchListings, sendMessage } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

type Post = {
  id: number;
  mlsNumber: string;
  address: string;
  price: number;
  compensation: string;
  document: string;
  agentName: string;
  companyName: string;
  createdAt: Date;
  updatedAt: Date;
}

type ChatMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

type Chat = {
  id: number;
  participants: { id: number; name: string }[];
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('listings')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [activeListings, setActiveListings] = useState<Post[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      participants: [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }],
      lastMessage: "Hi, I'm interested in your property.",
      timestamp: new Date(),
      messages: [
        { id: 1, senderId: 2, receiverId: 1, content: "Hi, I'm interested in your property.", timestamp: new Date() },
      ],
    },
    {
      id: 2,
      participants: [{ id: 1, name: 'John Doe' }, { id: 3, name: 'Bob Johnson' }],
      lastMessage: 'Is the house still available?',
      timestamp: new Date(),
      messages: [
        { id: 1, senderId: 3, receiverId: 1, content: 'Is the house still available?', timestamp: new Date() },
      ],
    },
  ])
  const [newPost, setNewPost] = useState({
    mlsNumber: '',
    address: '',
    price: '',
    compensation: '',
    document: null as File | null,
  })
  const [unreadMessages, setUnreadMessages] = useState(2)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const { toast } = useToast()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const loadListings = async () => {
      try {
        const listings = await fetchListings();
        setActiveListings(listings);
      } catch (error) {
        console.error('Error loading listings:', error);
        toast({
          title: "Error",
          description: "Failed to load listings. Please try again later.",
          variant: "destructive",
        });
      }
    };
    loadListings();
  }, [toast]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const results = await searchListings(searchQuery);
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching listings:', error);
      toast({
        title: "Error",
        description: "Failed to search listings. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newListing = await createListing({
        mlsNumber: newPost.mlsNumber,
        address: newPost.address,
        price: parseFloat(newPost.price),
        compensation: newPost.compensation,
        document: newPost.document ? newPost.document.name : 'No document',
      });
      setActiveListings(prevListings => [...prevListings, newListing])
      setNewPost({ mlsNumber: '', address: '', price: '', compensation: '', document: null })
      setIsDialogOpen(false)
      toast({
        title: "Success",
        description: "New listing created successfully.",
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleViewDocument = (documentUrl: string) => {
    setViewDocumentUrl(documentUrl)
  }

  const handleDownloadDocument = (documentUrl: string, fileName: string) => {
    console.log(`Downloading ${fileName} from ${documentUrl}`)
  }

  const handleSave = (postId: number) => {
    console.log(`Saving post with ID: ${postId}`);
    toast({
      title: "Saved",
      description: "Listing saved successfully.",
    });
  };

  const handleSignNow = (postId: number) => {
    console.log(`Signing document for post with ID: ${postId}`);
    toast({
      title: "Signed",
      description: "Document signed successfully.",
    });
  };

  const handleStartChat = (postId: number) => {
    console.log(`Starting chat for post with ID: ${postId}`);
    setIsChatOpen(true);
    toast({
      title: "Chat Started",
      description: "You can now communicate with the agent.",
    });
  };

  const handleLogout = () => {
    console.log('Logging out');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeChat && newMessage.trim()) {
      try {
        const sentMessage = await sendMessage(activeChat.id, {
          content: newMessage,
          senderId: 1,
          receiverId: activeChat.participants.find(p => p.id !== 1)?.id || 0,
        });
        setChats(prevChats => prevChats.map(chat => 
          chat.id === activeChat.id 
            ? { ...chat, messages: [...chat.messages, sentMessage], lastMessage: newMessage, timestamp: new Date() }
            : chat
        ));
        setNewMessage('');
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully.",
        });
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/respio-logo-Gzb9aVHXogBvwO7UsJjduYMDa22zOm.png"
            alt="Respio Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
          {!isMobile && (
            <nav className="flex items-center space-x-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new property listing.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mlsNumber">MLS Number</Label>
                      <Input
                        id="mlsNumber"
                        value={newPost.mlsNumber}
                        onChange={(e) => setNewPost({ ...newPost, mlsNumber: e.target.value })}
                        placeholder="Enter MLS number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Property Address</Label>
                      <Input
                        id="address"
                        value={newPost.address}
                        onChange={(e) => setNewPost({ ...newPost, address: e.target.value })}
                        placeholder="Enter property address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newPost.price}
                        onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="compensation">Buyer's Agent Compensation</Label>
                      <Input
                        id="compensation"
                        value={newPost.compensation}
                        onChange={(e) => setNewPost({ ...newPost, compensation: e.target.value })}
                        placeholder="Enter compensation (e.g., 2.5% or $5000)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document">Upload Document</Label>
                      <Input
                        id="document"
                        type="file"
                        onChange={(e) => setNewPost({ ...newPost, document: e.target.files?.[0] || null })}
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Post</Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <MessageCircle className="mr-2 h-4 w-4" /> Messages
                    {unreadMessages > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                        {unreadMessages}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] sm:h-[600px] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Messages</DialogTitle>
                  </DialogHeader>
                  <div className="flex-grow flex overflow-hidden">
                    <div className="w-1/3 border-r">
                      <ScrollArea className="h-[500px]">
                        {chats.map((chat) => (
                          <Card 
                            key={chat.id} 
                            className={`mb-2 cursor-pointer ${activeChat?.id === chat.id ? 'bg-blue-100' : ''}`}
                            onClick={() => setActiveChat(chat)}
                          >
                            <CardContent className="p-4">
                              <h3 className="font-bold">{chat.participants.find(p => p.id !== 1)?.name}</h3>
                              <p className="text-sm text-gray-500">{chat.lastMessage}</p>
                              <p className="text-xs text-gray-400">{chat.timestamp.toLocaleString()}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </ScrollArea>
                    </div>
                    <div className="w-2/3 flex flex-col">
                      {activeChat ? (
                        <>
                          <ScrollArea className="flex-grow p-4">
                            {activeChat.messages.map((message) => (
                              <div key={message.id} className={`mb-2 ${message.senderId === 1 ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-2 rounded-lg ${message.senderId === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                  {message.content}
                                </div>
                                <div className="text-xs text-gray-400">{message.timestamp.toLocaleString()}</div>
                              </div>
                            ))}
                          </ScrollArea>
                          <form onSubmit={handleSendMessage} className="p-4 border-t flex">
                            <Input 
                              value={newMessage} 
                              onChange={(e) => setNewMessage(e.target.value)} 
                              placeholder="Type your message..." 
                              className="flex-grow mr-2"
                            />
                            <Button type="submit"><Send className="h-4 w-4" /></Button>
                          </form>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Select a chat to start messaging</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="mr-2 h-4 w-4" /> Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><User className="mr-2 h-4 w-4" /> Profile</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                    <User className="mr-2 h-4 w-4" /> View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSubscriptionOpen(true)}>
                    <DollarSign className="mr-2 h-4 w-4" /> Manage Subscription
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 flex-grow overflow-auto mt-20">
        {/* Profile Summary */}
        <Card className="mb-6">
          <CardContent className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4 p-4">
            <Image
              src="/placeholder.svg?height=100&width=100"
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">Welcome, John Doe</h2>
              <p className="text-gray-600">Real Estate Agent | Premium Plan</p>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                type="text"
                placeholder="Search by MLS number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((post) => (
                  <Card key={post.id} className="overflow-hidden relative">
                    <CardContent className="p-4">
                      <div className="absolute top-2 right-2 space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700" onClick={() => handleSave(post.id)}>
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700" onClick={() => handleStartChat(post.id)}>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mb-2">
                        <h3 className="font-bold text-lg">{post.agentName}</h3>
                        <p className="text-sm text-gray-600">{post.companyName}</p>
                      </div>
                      <Separator className="mb-2" />
                      <p className="text-sm text-gray-600 mb-1">{post.address}</p>
                      <p className="text-sm text-gray-600 mb-2">MLS# {post.mlsNumber}</p>
                      <p className="text-sm font-semibold mb-2">Price: ${post.price.toLocaleString()}</p>
                      <Separator className="my-2" />
                      <div className="flex justify-center mb-2">
                        <span className="text-sm bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                          Buyer's Agent Compensation: {post.compensation}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <h4 className="font-semibold mb-2">Documents</h4>
                      <Card className="mt-2">
                        <CardContent className="p-4">
                          <div className="flex items-center mb-2">
                            <FileText className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-sm font-medium">{post.document}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm" onClick={() => handleViewDocument(post.document)} className="bg-blue-500 text-white hover:bg-blue-600">
                              View
                            </Button>
                            <Button variant="default" size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => handleSignNow(post.id)}>
                              Sign Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <div className="text-xs text-gray-400 mt-4">
                        <p>Created: {post.createdAt.toLocaleString()}</p>
                        <p>Updated: {post.updatedAt.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="saved">Saved Searches</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You have {activeListings.length} active listings.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {activeListings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden relative">
                      <CardContent className="p-4">
                        <div className="absolute top-2 right-2 space-x-2">
                          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mb-2">
                          <h3 className="font-bold text-lg">{listing.agentName}</h3>
                          <p className="text-sm text-gray-600">{listing.companyName}</p>
                        </div>
                        <Separator className="mb-2" />
                        <p className="text-sm text-gray-600 mb-1">{listing.address}</p>
                        <p className="text-sm text-gray-600 mb-2">MLS# {listing.mlsNumber}</p>
                        <p className="text-sm font-semibold mb-2">Price: ${listing.price.toLocaleString()}</p>
                        <Separator className="my-2" />
                        <div className="flex justify-center mb-2">
                          <span className="text-sm bg-orange-100 text-orange-800 rounded-full px-3 py-1">
                            Buyer's Agent Compensation: {listing.compensation}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <h4 className="font-semibold mb-2">Documents</h4>
                        <Card className="mt-2">
                          <CardContent className="p-4">
                            <div className="flex items-center mb-2">
                              <FileText className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="text-sm font-medium">{listing.document}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <Button variant="outline" size="sm" onClick={() => handleViewDocument(listing.document)} className="bg-blue-500 text-white hover:bg-blue-600">
                                View
                              </Button>
                              <Button variant="default" size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => handleSignNow(listing.id)}>
                                Sign Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                        <div className="text-xs text-gray-400 mt-4">
                          <p>Created: {listing.createdAt.toLocaleString()}</p>
                          <p>Updated: {listing.updatedAt.toLocaleString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Searches</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You have 3 saved searches.</p>
                <ul className="list-disc list-inside mt-4">
                  <li>3-bedroom houses in Downtown</li>
                  <li>Condos under $300,000</li>
                  <li>Waterfront properties</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agreements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compensation Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You have 2 pending and 3 signed agreements.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Agreements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside">
                        <li>123 Oak St - 2.5% commission</li>
                        <li>456 Pine Ave - $5,000 flat fee</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Signed Agreements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside">
                        <li>789 Elm Rd - 3% commission</li>
                        <li>101 Maple Ln - 2.7% commission</li>
                        <li>202 Birch Blvd - $7,500 flat fee</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 p-4">
        <div className="container mx-auto text-center text-gray-600">
          © 2023 Respio. All rights reserved.
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-40">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab('listings')}>
            <Home className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="sm" className="relative" onClick={() => setIsChatOpen(true)}>
            <MessageCircle className="h-6 w-6" />
            {unreadMessages > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                {unreadMessages}
              </span>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Enter the details for the new property listing.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mlsNumber">MLS Number</Label>
                  <Input
                    id="mlsNumber"
                    value={newPost.mlsNumber}
                    onChange={(e) => setNewPost({ ...newPost, mlsNumber: e.target.value })}
                    placeholder="Enter MLS number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Property Address</Label>
                  <Input
                    id="address"
                    value={newPost.address}
                    onChange={(e) => setNewPost({ ...newPost,address: e.target.value })}
                    placeholder="Enter property address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPost.price}
                    onChange={(e) => setNewPost({ ...newPost, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compensation">Buyer's Agent Compensation</Label>
                  <Input
                    id="compensation"
                    value={newPost.compensation}
                    onChange={(e) => setNewPost({ ...newPost, compensation: e.target.value })}
                    placeholder="Enter compensation (e.g., 2.5% or $5000)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Document</Label>
                  <Input
                    id="document"
                    type="file"
                    onChange={(e) => setNewPost({ ...newPost, document: e.target.files?.[0] || null })}
                  />
                </div>
                <Button type="submit" className="w-full">Create Post</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-6 w-6" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                {unreadNotifications}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                <User className="mr-2 h-4 w-4" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSubscriptionOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" /> Manage Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      )}

      {/* Document Viewer Modal */}
      {viewDocumentUrl && (
        <Dialog open={!!viewDocumentUrl} onOpenChange={() => setViewDocumentUrl(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Document Viewer</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[600px] border border-gray-200 rounded">
              <p className="p-4">Document: {viewDocumentUrl}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDownloadDocument(viewDocumentUrl, `document.pdf`)}>
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">John Doe</h2>
            <p>Email: john.doe@example.com</p>
            <p>Phone: (123) 456-7890</p>
            <p>License #: RE12345</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
            <p>Notification preferences</p>
            <p>Privacy settings</p>
            <p>Change password</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Modal */}
      <Dialog open={isSubscriptionOpen} onOpenChange={setIsSubscriptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Current Plan: Premium</h2>
            <Button variant="outline" className="mr-2">Upgrade Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}